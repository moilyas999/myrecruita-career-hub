/**
 * Structured logging for CV parsing
 * Provides correlation IDs and metrics collection
 */

// ============================================================================
// Types
// ============================================================================

export interface ParseLogEntry {
  correlationId: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  context?: Record<string, unknown>;
}

export interface ParseMetrics {
  correlationId: string;
  fileName: string;
  fileType: string;
  fileSizeBytes: number;
  textLength: number;
  parseStartTime: number;
  parseEndTime?: number;
  parseTimeMs?: number;
  aiModel: string;
  extractionMethod: 'ai' | 'fallback' | 'ai_with_fallback';
  extractedFields: string[];
  confidenceScores: Record<string, number>;
  errors: string[];
  warnings: string[];
  retryCount: number;
  success: boolean;
}

// ============================================================================
// Correlation ID Generator
// ============================================================================

export function generateCorrelationId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `parse-${timestamp}-${random}`;
}

// ============================================================================
// Structured Logger
// ============================================================================

export class ParseLogger {
  private correlationId: string;
  private logs: ParseLogEntry[] = [];
  private metrics: Partial<ParseMetrics>;

  constructor(fileName: string, fileType: string, fileSizeBytes: number) {
    this.correlationId = generateCorrelationId();
    this.metrics = {
      correlationId: this.correlationId,
      fileName,
      fileType,
      fileSizeBytes,
      parseStartTime: Date.now(),
      aiModel: 'google/gemini-3-flash-preview',
      extractedFields: [],
      confidenceScores: {},
      errors: [],
      warnings: [],
      retryCount: 0,
      success: false
    };
    
    this.info('Parse started', { fileName, fileType, fileSizeBytes });
  }

  getCorrelationId(): string {
    return this.correlationId;
  }

  private log(level: ParseLogEntry['level'], message: string, context?: Record<string, unknown>): void {
    const entry: ParseLogEntry = {
      correlationId: this.correlationId,
      timestamp: new Date().toISOString(),
      level,
      message,
      context
    };
    
    this.logs.push(entry);
    
    // Also output to console with structured format
    const prefix = `[${this.correlationId}] [${level.toUpperCase()}]`;
    if (context) {
      console.log(`${prefix} ${message}`, JSON.stringify(context));
    } else {
      console.log(`${prefix} ${message}`);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: Record<string, unknown>): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    this.log('warn', message, context);
    if (this.metrics.warnings) {
      this.metrics.warnings.push(message);
    }
  }

  error(message: string, context?: Record<string, unknown>): void {
    this.log('error', message, context);
    if (this.metrics.errors) {
      this.metrics.errors.push(message);
    }
  }

  setTextLength(length: number): void {
    this.metrics.textLength = length;
  }

  setExtractionMethod(method: ParseMetrics['extractionMethod']): void {
    this.metrics.extractionMethod = method;
  }

  addExtractedField(field: string, confidence: number): void {
    if (this.metrics.extractedFields && !this.metrics.extractedFields.includes(field)) {
      this.metrics.extractedFields.push(field);
    }
    if (this.metrics.confidenceScores) {
      this.metrics.confidenceScores[field] = confidence;
    }
  }

  incrementRetry(): void {
    if (typeof this.metrics.retryCount === 'number') {
      this.metrics.retryCount++;
    }
  }

  complete(success: boolean, extractedFields?: string[]): ParseMetrics {
    this.metrics.parseEndTime = Date.now();
    this.metrics.parseTimeMs = this.metrics.parseEndTime - (this.metrics.parseStartTime || 0);
    this.metrics.success = success;
    
    if (extractedFields) {
      this.metrics.extractedFields = extractedFields;
    }

    this.info('Parse completed', {
      success,
      parseTimeMs: this.metrics.parseTimeMs,
      extractedFields: this.metrics.extractedFields,
      errorCount: this.metrics.errors?.length || 0,
      warningCount: this.metrics.warnings?.length || 0
    });

    return this.metrics as ParseMetrics;
  }

  getLogs(): ParseLogEntry[] {
    return [...this.logs];
  }

  getMetrics(): Partial<ParseMetrics> {
    return { ...this.metrics };
  }
}

// ============================================================================
// Analytics Storage Helper
// ============================================================================

export async function storeParseAnalytics(
  supabase: { from: (table: string) => { insert: (data: Record<string, unknown>) => Promise<{ error: unknown }> } },
  metrics: ParseMetrics
): Promise<void> {
  try {
    const { error } = await supabase.from('parse_analytics').insert({
      correlation_id: metrics.correlationId,
      file_name: metrics.fileName,
      file_type: metrics.fileType,
      file_size_bytes: metrics.fileSizeBytes,
      text_length: metrics.textLength || 0,
      parse_time_ms: metrics.parseTimeMs || 0,
      ai_model: metrics.aiModel,
      extraction_method: metrics.extractionMethod,
      extracted_fields: metrics.extractedFields,
      confidence_scores: metrics.confidenceScores,
      errors: metrics.errors,
      warnings: metrics.warnings,
      retry_count: metrics.retryCount,
      success: metrics.success
    });

    if (error) {
      console.error('[ParseAnalytics] Failed to store metrics:', error);
    }
  } catch (err) {
    // Don't fail the parse if analytics storage fails
    console.error('[ParseAnalytics] Exception storing metrics:', err);
  }
}

// ============================================================================
// Request Timeout Helper
// ============================================================================

export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => {
      setTimeout(() => reject(new Error(errorMessage)), timeoutMs);
    })
  ]);
}
