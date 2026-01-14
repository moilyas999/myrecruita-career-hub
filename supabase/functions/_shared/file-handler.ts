/**
 * File handling utilities for CV processing
 * Handles download, extraction, and format detection
 */

import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';
import JSZip from 'https://esm.sh/jszip@3.10.1';

// ============================================================================
// Types
// ============================================================================

export interface FileDownloadResult {
  success: true;
  data: ArrayBuffer;
  mimeType: string;
  fileName: string;
}

export interface FileDownloadError {
  success: false;
  error: string;
}

export type DownloadResult = FileDownloadResult | FileDownloadError;

export type FileType = 'pdf' | 'docx' | 'doc' | 'unknown';

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
// File Type Detection
// ============================================================================

export function getFileType(fileName: string): FileType {
  const extension = fileName.toLowerCase().split('.').pop();
  
  switch (extension) {
    case 'pdf':
      return 'pdf';
    case 'docx':
      return 'docx';
    case 'doc':
      return 'doc';
    default:
      return 'unknown';
  }
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
      return { success: false, error: `Failed to download file: ${error.message}` };
    }

    if (!data) {
      return { success: false, error: 'No data received from storage' };
    }

    const arrayBuffer = await data.arrayBuffer();
    const fileName = filePath.split('/').pop() || 'document';
    const fileType = getFileType(fileName);
    const mimeType = getMimeType(fileType);

    console.log(`Downloaded ${fileName} (${fileType}, ${arrayBuffer.byteLength} bytes)`);

    return {
      success: true,
      data: arrayBuffer,
      mimeType,
      fileName
    };
  } catch (error) {
    console.error('Download exception:', error);
    return { 
      success: false, 
      error: `Download failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export async function downloadFromUrl(url: string): Promise<DownloadResult> {
  try {
    console.log(`Downloading file from URL: ${url}`);
    
    const response = await fetch(url);
    
    if (!response.ok) {
      return { success: false, error: `HTTP ${response.status}: ${response.statusText}` };
    }

    const arrayBuffer = await response.arrayBuffer();
    const fileName = url.split('/').pop()?.split('?')[0] || 'document';
    const fileType = getFileType(fileName);
    const mimeType = getMimeType(fileType);

    console.log(`Downloaded ${fileName} (${fileType}, ${arrayBuffer.byteLength} bytes)`);

    return {
      success: true,
      data: arrayBuffer,
      mimeType,
      fileName
    };
  } catch (error) {
    console.error('URL download exception:', error);
    return { 
      success: false, 
      error: `URL download failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
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
