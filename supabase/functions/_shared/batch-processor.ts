/**
 * Batch Processing Utilities for robust bulk import
 * Handles chunked processing, timeout management, and continuation
 */

import type { SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

export interface BatchConfig {
  /** Maximum number of files to process per invocation */
  batchSize: number;
  /** Maximum execution time before scheduling continuation (ms) */
  maxExecutionTimeMs: number;
  /** Interval between heartbeat updates (files) */
  heartbeatInterval: number;
}

export interface BatchContext {
  sessionId: string;
  startTime: number;
  processedCount: number;
  config: BatchConfig;
}

export interface FileProcessingResult {
  fileId: string;
  success: boolean;
  errorCategory?: string;
  errorMessage?: string;
  parseTimeMs?: number;
}

export interface BatchResult {
  processed: number;
  succeeded: number;
  failed: number;
  shouldContinue: boolean;
  continuationScheduled: boolean;
  errorBreakdown: Record<string, number>;
}

const DEFAULT_CONFIG: BatchConfig = {
  batchSize: 5,
  maxExecutionTimeMs: 20000, // 20 seconds (buffer before edge function timeout)
  heartbeatInterval: 2
};

/**
 * Create a batch processing context
 */
export function createBatchContext(
  sessionId: string,
  config: Partial<BatchConfig> = {}
): BatchContext {
  return {
    sessionId,
    startTime: Date.now(),
    processedCount: 0,
    config: { ...DEFAULT_CONFIG, ...config }
  };
}

/**
 * Check if we should continue processing or schedule a continuation
 */
export function shouldContinueProcessing(context: BatchContext): boolean {
  const elapsed = Date.now() - context.startTime;
  return elapsed < context.config.maxExecutionTimeMs;
}

/**
 * Check if we've reached the batch limit
 */
export function hasReachedBatchLimit(context: BatchContext): boolean {
  return context.processedCount >= context.config.batchSize;
}

/**
 * Check if we should send a heartbeat
 */
export function shouldSendHeartbeat(context: BatchContext): boolean {
  return context.processedCount > 0 && 
         context.processedCount % context.config.heartbeatInterval === 0;
}

/**
 * Update session heartbeat to indicate processing is still active
 */
export async function updateHeartbeat(
  supabase: SupabaseClient,
  sessionId: string,
  processingFileId?: string
): Promise<void> {
  await supabase
    .from('bulk_import_sessions')
    .update({
      last_heartbeat: new Date().toISOString(),
      processing_file_id: processingFileId || null
    })
    .eq('id', sessionId);
}

/**
 * Schedule a continuation of processing
 */
export async function scheduleContinuation(
  supabase: SupabaseClient,
  sessionId: string
): Promise<boolean> {
  try {
    console.log(`[BatchProcessor] Scheduling continuation for session ${sessionId}`);
    
    const { error } = await supabase.functions.invoke('process-bulk-import', {
      body: { session_id: sessionId, continuation: true }
    });

    if (error) {
      console.error('[BatchProcessor] Failed to schedule continuation:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('[BatchProcessor] Error scheduling continuation:', err);
    return false;
  }
}

/**
 * Recompute session counts from actual file statuses
 */
export async function recomputeSessionCounts(
  supabase: SupabaseClient,
  sessionId: string
): Promise<{
  totalFiles: number;
  parsedCount: number;
  importedCount: number;
  failedCount: number;
  pendingCount: number;
}> {
  const { data: files } = await supabase
    .from('bulk_import_files')
    .select('status')
    .eq('session_id', sessionId);

  if (!files) {
    return {
      totalFiles: 0,
      parsedCount: 0,
      importedCount: 0,
      failedCount: 0,
      pendingCount: 0
    };
  }

  const totalFiles = files.length;
  const parsedCount = files.filter(f => f.status === 'parsed').length;
  const importedCount = files.filter(f => f.status === 'imported').length;
  const failedCount = files.filter(f => f.status === 'error').length;
  const pendingCount = files.filter(f => 
    ['pending', 'parsing', 'importing'].includes(f.status)
  ).length;

  return {
    totalFiles,
    parsedCount,
    importedCount,
    failedCount,
    pendingCount
  };
}

/**
 * Update session with computed counts and status
 */
export async function updateSessionProgress(
  supabase: SupabaseClient,
  sessionId: string,
  errorBreakdown?: Record<string, number>,
  avgParseTimeMs?: number
): Promise<void> {
  const counts = await recomputeSessionCounts(supabase, sessionId);
  
  // Determine final status
  let status = 'processing';
  let completedAt: string | null = null;

  if (counts.pendingCount === 0) {
    status = 'completed';
    completedAt = new Date().toISOString();
  }

  const updateData: Record<string, unknown> = {
    status,
    completed_at: completedAt,
    parsed_count: counts.parsedCount,
    imported_count: counts.importedCount,
    failed_count: counts.failedCount,
    last_heartbeat: new Date().toISOString()
  };

  if (errorBreakdown) {
    updateData.error_breakdown = errorBreakdown;
  }

  if (avgParseTimeMs !== undefined) {
    updateData.avg_parse_time_ms = Math.round(avgParseTimeMs);
  }

  await supabase
    .from('bulk_import_sessions')
    .update(updateData)
    .eq('id', sessionId);
}

/**
 * Mark file as processing started
 */
export async function markFileProcessingStarted(
  supabase: SupabaseClient,
  fileId: string
): Promise<void> {
  await supabase
    .from('bulk_import_files')
    .update({
      status: 'parsing',
      processing_started_at: new Date().toISOString()
    })
    .eq('id', fileId);
}

/**
 * Mark file as successfully parsed
 */
export async function markFileParsed(
  supabase: SupabaseClient,
  fileId: string,
  parsedData: Record<string, unknown>
): Promise<void> {
  await supabase
    .from('bulk_import_files')
    .update({
      status: 'parsed',
      parsed_data: parsedData,
      processed_at: new Date().toISOString()
    })
    .eq('id', fileId);
}

/**
 * Mark file as successfully imported
 */
export async function markFileImported(
  supabase: SupabaseClient,
  fileId: string,
  cvSubmissionId: string
): Promise<void> {
  await supabase
    .from('bulk_import_files')
    .update({
      status: 'imported',
      cv_submission_id: cvSubmissionId,
      processed_at: new Date().toISOString()
    })
    .eq('id', fileId);
}

/**
 * Mark file as failed with error details
 */
export async function markFileFailed(
  supabase: SupabaseClient,
  fileId: string,
  errorMessage: string,
  errorCategory: string,
  retryCount: number
): Promise<void> {
  await supabase
    .from('bulk_import_files')
    .update({
      status: 'error',
      error_message: errorMessage,
      error_category: errorCategory,
      retry_count: retryCount,
      processed_at: new Date().toISOString()
    })
    .eq('id', fileId);
}

/**
 * Get files to process for a session
 */
export async function getFilesToProcess(
  supabase: SupabaseClient,
  sessionId: string,
  options: {
    retryFailed?: boolean;
    fileIds?: string[];
    limit?: number;
  } = {}
): Promise<Array<{
  id: string;
  file_name: string;
  file_path: string;
  file_url: string;
  status: string;
  retry_count: number;
}>> {
  let query = supabase
    .from('bulk_import_files')
    .select('id, file_name, file_path, file_url, status, retry_count')
    .eq('session_id', sessionId);

  if (options.fileIds && options.fileIds.length > 0) {
    query = query.in('id', options.fileIds);
  } else if (options.retryFailed) {
    query = query.in('status', ['error', 'pending']);
  } else {
    query = query.in('status', ['pending', 'parsing', 'parsed', 'importing']);
  }

  if (options.limit) {
    query = query.limit(options.limit);
  }

  // Order by retry_count (prioritize files that haven't been retried)
  // then by file size (smaller files first for faster feedback)
  query = query.order('retry_count', { ascending: true });

  const { data, error } = await query;

  if (error) {
    console.error('[BatchProcessor] Error fetching files:', error);
    return [];
  }

  return data || [];
}

/**
 * Check for duplicate CV by email
 */
export async function checkForDuplicate(
  supabase: SupabaseClient,
  email: string
): Promise<{ isDuplicate: boolean; existingId?: string }> {
  const { data } = await supabase
    .from('cv_submissions')
    .select('id')
    .ilike('email', email)
    .limit(1)
    .maybeSingle();

  if (data) {
    return { isDuplicate: true, existingId: data.id };
  }

  return { isDuplicate: false };
}
