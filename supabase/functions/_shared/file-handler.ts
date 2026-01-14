/**
 * File handling utilities for CV processing
 * Handles download, extraction, and format detection
 * Enhanced with magic byte detection and file size limits
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import JSZip from 'https://esm.sh/jszip@3.10.1';

// ============================================================================
// Constants
// ============================================================================

const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB limit
const MIN_FILE_SIZE_BYTES = 100; // Minimum 100 bytes

// Magic bytes for file type detection
const MAGIC_BYTES: Record<string, number[]> = {
  pdf: [0x25, 0x50, 0x44, 0x46], // %PDF
  zip: [0x50, 0x4B, 0x03, 0x04], // PK.. (DOCX is a ZIP)
  doc: [0xD0, 0xCF, 0x11, 0xE0], // OLE compound document
};

// ============================================================================
// Types
// ============================================================================

export interface FileDownloadResult {
  success: true;
  data: ArrayBuffer;
  mimeType: string;
  fileName: string;
  detectedType: FileType;
  fileSizeBytes: number;
}

export interface FileDownloadError {
  success: false;
  error: string;
  errorCode?: 'FILE_TOO_LARGE' | 'FILE_TOO_SMALL' | 'DOWNLOAD_FAILED' | 'INVALID_FORMAT';
}

export type DownloadResult = FileDownloadResult | FileDownloadError;

export type FileType = 'pdf' | 'docx' | 'doc' | 'rtf' | 'txt' | 'unknown';

// ============================================================================
// Supabase Client Factory
// ============================================================================

export function createSupabaseClient(): SupabaseClient {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Missing Supabase configuration');
  }

  return createClient(supabaseUrl, supabaseServiceKey);
}

// ============================================================================
// File Type Detection (Enhanced with Magic Bytes)
// ============================================================================

/**
 * Detect file type from extension
 */
export function getFileTypeFromExtension(fileName: string): FileType {
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'docx':
      return 'docx';
    case 'doc':
      return 'doc';
    case 'rtf':
      return 'rtf';
    case 'txt':
      return 'txt';
    default:
      return 'unknown';
  }
}

/**
 * Detect file type from magic bytes (more reliable than extension)
 */
export function getFileTypeFromMagicBytes(data: ArrayBuffer): FileType {
  const bytes = new Uint8Array(data.slice(0, 8));
  
  // Check for PDF
  if (matchesMagicBytes(bytes, MAGIC_BYTES.pdf)) {
    return 'pdf';
  }
  
  // Check for ZIP-based formats (DOCX)
  if (matchesMagicBytes(bytes, MAGIC_BYTES.zip)) {
    return 'docx'; // DOCX files are ZIP archives
  }
  
  // Check for legacy DOC (OLE compound document)
  if (matchesMagicBytes(bytes, MAGIC_BYTES.doc)) {
    return 'doc';
  }
  
  // Check for RTF
  if (bytes[0] === 0x7B && bytes[1] === 0x5C && bytes[2] === 0x72 && bytes[3] === 0x74 && bytes[4] === 0x66) {
    return 'rtf'; // {\rtf
  }
  
  return 'unknown';
}

function matchesMagicBytes(data: Uint8Array, magic: number[]): boolean {
  if (data.length < magic.length) return false;
  return magic.every((byte, index) => data[index] === byte);
}

/**
 * Combined file type detection (magic bytes + extension fallback)
 */
export function getFileType(fileName: string, data?: ArrayBuffer): FileType {
  // First try magic bytes if data is available
  if (data) {
    const magicType = getFileTypeFromMagicBytes(data);
    if (magicType !== 'unknown') {
      return magicType;
    }
  }
  
  // Fall back to extension
  return getFileTypeFromExtension(fileName);
}

/**
 * Validate file size
 */
export function validateFileSize(sizeBytes: number): { valid: boolean; error?: string } {
  if (sizeBytes > MAX_FILE_SIZE_BYTES) {
    return { 
      valid: false, 
      error: `File too large: ${(sizeBytes / 1024 / 1024).toFixed(2)}MB (max ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB)` 
    };
  }
  
  if (sizeBytes < MIN_FILE_SIZE_BYTES) {
    return { 
      valid: false, 
      error: `File too small: ${sizeBytes} bytes (min ${MIN_FILE_SIZE_BYTES} bytes)` 
    };
  }
  
  return { valid: true };
}

export function getMimeType(fileType: FileType): string {
  switch (fileType) {
    case 'pdf':
      return 'application/pdf';
    case 'docx':
      return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    case 'doc':
      return 'application/msword';
    default:
      return 'application/octet-stream';
  }
}

// ============================================================================
// File Download
// ============================================================================

export async function downloadFromStorage(
  supabase: SupabaseClient,
  bucket: string,
  filePath: string
): Promise<DownloadResult> {
  try {
    console.log(`Downloading file from ${bucket}/${filePath}`);
    
    const { data, error } = await supabase.storage
      .from(bucket)
      .download(filePath);

    if (error) {
      console.error('Storage download error:', error);
      return { success: false, error: `Failed to download file: ${error.message}`, errorCode: 'DOWNLOAD_FAILED' };
    }

    if (!data) {
      return { success: false, error: 'No data received from storage', errorCode: 'DOWNLOAD_FAILED' };
    }

    const arrayBuffer = await data.arrayBuffer();
    const fileSizeBytes = arrayBuffer.byteLength;
    
    // Validate file size
    const sizeValidation = validateFileSize(fileSizeBytes);
    if (!sizeValidation.valid) {
      return { 
        success: false, 
        error: sizeValidation.error!, 
        errorCode: fileSizeBytes > MAX_FILE_SIZE_BYTES ? 'FILE_TOO_LARGE' : 'FILE_TOO_SMALL' 
      };
    }
    
    const fileName = filePath.split('/').pop() || 'document';
    const detectedType = getFileType(fileName, arrayBuffer);
    const mimeType = getMimeType(detectedType);

    console.log(`Downloaded ${fileName} (detected: ${detectedType}, extension: ${getFileTypeFromExtension(fileName)}, ${fileSizeBytes} bytes)`);

    return {
      success: true,
      data: arrayBuffer,
      mimeType,
      fileName,
      detectedType,
      fileSizeBytes
    };
  } catch (error) {
    console.error('Download exception:', error);
    return { 
      success: false, 
      error: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      errorCode: 'DOWNLOAD_FAILED'
    };
  }
}

export async function downloadFromUrl(url: string): Promise<DownloadResult> {
  try {
    console.log(`Downloading file from URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}`, errorCode: 'DOWNLOAD_FAILED' };
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileSizeBytes = arrayBuffer.byteLength;
    
    // Validate file size
    const sizeValidation = validateFileSize(fileSizeBytes);
    if (!sizeValidation.valid) {
      return { 
        success: false, 
        error: sizeValidation.error!, 
        errorCode: fileSizeBytes > MAX_FILE_SIZE_BYTES ? 'FILE_TOO_LARGE' : 'FILE_TOO_SMALL' 
      };
    }
    
    const fileName = url.split('/').pop()?.split('?')[0] || 'document';
    const detectedType = getFileType(fileName, arrayBuffer);
    const mimeType = getMimeType(detectedType);

    console.log(`Downloaded ${fileName} (detected: ${detectedType}, ${fileSizeBytes} bytes)`);

    return {
      success: true,
      data: arrayBuffer,
      mimeType,
      fileName,
      detectedType,
      fileSizeBytes
    };
  } catch (error) {
    console.error('URL download exception:', error);
    return { 
      success: false, 
      error: `URL download failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      errorCode: 'DOWNLOAD_FAILED'
    };
  }
}

// ============================================================================
// Text Extraction
// ============================================================================

/**
 * Extract text from a single DOCX XML file
 */
function extractTextFromXml(xml: string): string {
  return xml
    // Handle table cells - add tab separator
    .replace(/<\/w:tc>/g, '\t')
    // Handle table rows - add newline
    .replace(/<\/w:tr>/g, '\n')
    // Replace paragraph breaks with newlines
    .replace(/<\/w:p>/g, '\n')
    // Replace line breaks
    .replace(/<w:br[^>]*>/g, '\n')
    // Replace tabs
    .replace(/<w:tab[^>]*>/g, '\t')
    // Handle soft hyphens and other special chars
    .replace(/<w:softHyphen[^>]*>/g, '-')
    // Remove all remaining XML tags
    .replace(/<[^>]+>/g, '')
    // Decode common XML entities
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(parseInt(code)))
    // Clean up whitespace within lines (preserve structure)
    .replace(/\t{2,}/g, '\t')
    .replace(/ {2,}/g, ' ')
    .trim();
}

/**
 * Extract text content from a DOCX file
 * Handles main document, headers, and footers
 */
export async function extractTextFromDocx(arrayBuffer: ArrayBuffer): Promise<string> {
  try {
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(arrayBuffer);
    
    const textParts: string[] = [];
    
    // Extract headers (header1.xml, header2.xml, etc.)
    const headerFiles = Object.keys(zipContent.files).filter(f => f.match(/^word\/header\d*\.xml$/));
    for (const headerFile of headerFiles) {
      const headerXml = await zipContent.file(headerFile)?.async('string');
      if (headerXml) {
        const headerText = extractTextFromXml(headerXml);
        if (headerText.trim()) {
          textParts.push(headerText);
        }
      }
    }
    
    // Extract main document
    const documentXml = await zipContent.file('word/document.xml')?.async('string');
    if (!documentXml) {
      console.warn('No document.xml found in DOCX');
      return '';
    }
    
    const mainText = extractTextFromXml(documentXml);
    textParts.push(mainText);
    
    // Extract footers (footer1.xml, footer2.xml, etc.)
    const footerFiles = Object.keys(zipContent.files).filter(f => f.match(/^word\/footer\d*\.xml$/));
    for (const footerFile of footerFiles) {
      const footerXml = await zipContent.file(footerFile)?.async('string');
      if (footerXml) {
        const footerText = extractTextFromXml(footerXml);
        if (footerText.trim()) {
          textParts.push(footerText);
        }
      }
    }
    
    // Combine all parts
    let text = textParts.join('\n\n');
    
    // Final cleanup - reduce excessive newlines
    text = text.replace(/\n{3,}/g, '\n\n').trim();

    console.log(`Extracted ${text.length} characters from DOCX (${headerFiles.length} headers, ${footerFiles.length} footers)`);
    
    // Log sample for debugging (first 300 chars)
    if (text.length > 0) {
      console.log(`DOCX sample: ${text.substring(0, 300).replace(/\n/g, '\\n')}...`);
    }
    
    return text;
  } catch (error) {
    console.error('DOCX extraction error:', error);
    throw new Error(`Failed to extract text from DOCX: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Extract text from legacy .doc files (basic extraction)
 * Note: Full .doc parsing requires specialized libraries
 */
export function extractTextFromDoc(arrayBuffer: ArrayBuffer): string {
  try {
    // Convert to text using TextDecoder - works for some .doc files
    const decoder = new TextDecoder('utf-8', { fatal: false });
    const text = decoder.decode(arrayBuffer);
    
    // Filter out binary content, keep only printable characters
    const cleanText = text
      .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, ' ')
      .replace(/\s{3,}/g, ' ')
      .trim();

    console.log(`Extracted ${cleanText.length} characters from DOC (basic extraction)`);
    return cleanText;
  } catch (error) {
    console.error('DOC extraction error:', error);
    return '';
  }
}

// ============================================================================
// Base64 Encoding
// ============================================================================

export function toBase64(arrayBuffer: ArrayBuffer): string {
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// ============================================================================
// Path Utilities
// ============================================================================

/**
 * Extract storage path from a full Supabase storage URL
 */
export function extractStoragePath(url: string): { bucket: string; path: string } | null {
  try {
    // Pattern: .../storage/v1/object/public/bucket-name/path/to/file
    const match = url.match(/\/storage\/v1\/object\/(?:public|sign)\/([^/]+)\/(.+)/);
    
    if (match) {
      return {
        bucket: match[1],
        path: decodeURIComponent(match[2].split('?')[0])
      };
    }

    // Try simpler pattern for direct paths
    const simpleMatch = url.match(/([^/]+)\/(.+\.(pdf|docx?))$/i);
    if (simpleMatch) {
      return {
        bucket: simpleMatch[1],
        path: simpleMatch[2]
      };
    }

    return null;
  } catch {
    return null;
  }
}
