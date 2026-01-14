/**
 * Process Bulk Import Edge Function - Robust Version
 * 
 * Features:
 * - Chunked processing with timeout-safe design
 * - Circuit breaker pattern for cascading failure prevention
 * - Adaptive rate limiting
 * - Comprehensive error categorization
 * - Heartbeat system for stale detection
 * - Automatic continuation scheduling
 * - Duplicate detection
 */

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { handleCors, jsonResponse, errorResponse } from '../_shared/cors.ts';
import { createSupabaseClient } from '../_shared/file-handler.ts';
import { parseCV } from '../_shared/cv-parser.ts';
import { CircuitBreaker, categorizeError, isRetryableError, ErrorCategory, type ErrorCategoryType } from '../_shared/circuit-breaker.ts';
import { AdaptiveRateLimiter, sleep } from '../_shared/rate-limiter.ts';
import {
  createBatchContext,
  shouldContinueProcessing,
  hasReachedBatchLimit,
  shouldSendHeartbeat,
  updateHeartbeat,
  scheduleContinuation,
  recomputeSessionCounts,
  updateSessionProgress,
  markFileProcessingStarted,
  markFileParsed,
  markFileImported,
  markFileFailed,
  getFilesToProcess,
  checkForDuplicate,
  type BatchContext,
  type BatchConfig
} from '../_shared/batch-processor.ts';
import type { BulkImportSession, ExtractedCVData } from '../_shared/types.ts';

// Configuration
const DEFAULT_BATCH_SIZE = 5;
const MAX_EXECUTION_TIME_MS = 20000; // 20 seconds safety buffer
const MAX_RETRIES_PER_FILE = 3;
const CIRCUIT_BREAKER_THRESHOLD = 3;
const CIRCUIT_BREAKER_RESET_MS = 30000;

interface ProcessRequest {
  session_id: string;
  retry_failed?: boolean;
  file_ids?: string[];
  continuation?: boolean;
  batch_size?: number;
}

interface ProcessingStats {
  processed: number;
  succeeded: number;
  failed: number;
  skipped: number;
  parseTimesMs: number[];
  errorBreakdown: Record<string, number>;
}

/**
 * Structured logging helper
 */
function log(
  level: 'info' | 'warn' | 'error',
  event: string,
  sessionId: string,
  data?: Record<string, unknown>
): void {
  console.log(JSON.stringify({
    timestamp: new Date().toISOString(),
    level,
    event,
    session_id: sessionId,
    ...data
  }));
}

serve(async (req) => {
  const corsResponse = handleCors(req);
  if (corsResponse) return corsResponse;

  try {
    const {
      session_id,
      retry_failed = false,
      file_ids = [],
      continuation = false,
      batch_size
    }: ProcessRequest = await req.json();

    if (!session_id) {
      return errorResponse('session_id is required', 400);
    }

    log('info', 'process_request_received', session_id, {
      retry_failed,
      file_ids_count: file_ids.length,
      continuation,
      batch_size
    });

    const supabase = createSupabaseClient();

    // Verify the session exists
    const { data: session, error: sessionError } = await supabase
      .from('bulk_import_sessions')
      .select('*')
      .eq('id', session_id)
      .single();

    if (sessionError || !session) {
      log('error', 'session_not_found', session_id);
      return errorResponse('Session not found', 404);
    }

    // Respond immediately, process in background
    const response = jsonResponse({
      success: true,
      message: 'Background processing started',
      session_id,
      continuation
    });

    // Background processing function
    const processFiles = async () => {
      // Initialize processing components
      const circuitBreaker = new CircuitBreaker({
        failureThreshold: CIRCUIT_BREAKER_THRESHOLD,
        resetTimeoutMs: CIRCUIT_BREAKER_RESET_MS
      });

      const rateLimiter = new AdaptiveRateLimiter({
        initialDelayMs: 1500,
        minDelayMs: 800,
        maxDelayMs: 8000
      });

      const batchConfig: Partial<BatchConfig> = {
        batchSize: batch_size || session.batch_size || DEFAULT_BATCH_SIZE,
        maxExecutionTimeMs: MAX_EXECUTION_TIME_MS
      };

      const context = createBatchContext(session_id, batchConfig);

      const stats: ProcessingStats = {
        processed: 0,
        succeeded: 0,
        failed: 0,
        skipped: 0,
        parseTimesMs: [],
        errorBreakdown: {}
      };

      try {
        log('info', 'processing_started', session_id, {
          batch_size: batchConfig.batchSize,
          continuation
        });

        // Update session status
        const statusUpdate: Record<string, unknown> = {
          status: 'processing',
          completed_at: null,
          error_message: null,
          last_heartbeat: new Date().toISOString()
        };

        if (!continuation && !retry_failed && file_ids.length === 0) {
          statusUpdate.started_at = new Date().toISOString();
        }

        await supabase
          .from('bulk_import_sessions')
          .update(statusUpdate)
          .eq('id', session_id);

        // Get files to process
        const files = await getFilesToProcess(supabase, session_id, {
          retryFailed: retry_failed,
          fileIds: file_ids.length > 0 ? file_ids : undefined,
          limit: batchConfig.batchSize
        });

        log('info', 'files_fetched', session_id, {
          file_count: files.length,
          retry_failed,
          specific_files: file_ids.length
        });

        if (files.length === 0) {
          // No files to process - finalize session
          await updateSessionProgress(supabase, session_id);
          log('info', 'no_files_to_process', session_id);
          return;
        }

        // Process each file
        for (const file of files) {
          // Check circuit breaker
          if (!circuitBreaker.canExecute()) {
            const cbState = circuitBreaker.getState();
            log('warn', 'circuit_breaker_open', session_id, {
              file_id: file.id,
              failures: cbState.failures,
              cooldown_ms: circuitBreaker.getRemainingCooldownMs()
            });

            // Skip this file but don't mark as failed
            stats.skipped++;
            continue;
          }

          // Check time limit
          if (!shouldContinueProcessing(context)) {
            log('info', 'time_limit_reached', session_id, {
              processed: stats.processed,
              elapsed_ms: Date.now() - context.startTime
            });
            break;
          }

          // Rate limiting
          await rateLimiter.waitForNextRequest();

          const parseStartTime = Date.now();

          try {
            // Mark file as processing
            await markFileProcessingStarted(supabase, file.id);

            // Send heartbeat if needed
            if (shouldSendHeartbeat(context)) {
              await updateHeartbeat(supabase, session_id, file.id);
            }

            log('info', 'file_processing_started', session_id, {
              file_id: file.id,
              file_name: file.file_name,
              retry_count: file.retry_count
            });

            // Parse the CV
            const result = await parseCV(supabase, file.file_path, { bucket: 'cv-uploads' });

            if (!result.success) {
              throw Object.assign(new Error(result.error), { code: result.errorCode });
            }

            const parsedData = result.data as ExtractedCVData;
            const parseTimeMs = Date.now() - parseStartTime;
            stats.parseTimesMs.push(parseTimeMs);

            // Update file with parsed data
            await markFileParsed(supabase, file.id, parsedData as unknown as Record<string, unknown>);

            // Check for duplicates before importing
            const { isDuplicate, existingId } = await checkForDuplicate(
              supabase,
              parsedData.email
            );

            if (isDuplicate) {
              log('warn', 'duplicate_detected', session_id, {
                file_id: file.id,
                email: parsedData.email,
                existing_id: existingId
              });
              // Still import but with a note
            }

            // Update file status to importing
            await supabase
              .from('bulk_import_files')
              .update({ status: 'importing' })
              .eq('id', file.id);

            // Insert into cv_submissions
            const { data: cvSubmission, error: insertError } = await supabase
              .from('cv_submissions')
              .insert({
                name: parsedData.name,
                email: parsedData.email,
                phone: parsedData.phone,
                job_title: parsedData.job_title,
                sector: parsedData.sector,
                location: parsedData.location,
                cv_file_url: file.file_url,
                skills: parsedData.skills,
                experience_summary: parsedData.experience_summary,
                years_experience: parsedData.years_experience,
                education_level: parsedData.education_level,
                seniority_level: parsedData.seniority_level,
                ai_profile: parsedData.ai_profile,
                cv_score: parsedData.cv_score,
                cv_score_breakdown: parsedData.cv_score_breakdown,
                scored_at: new Date().toISOString(),
                source: 'admin_bulk_background',
                added_by: (session as BulkImportSession).user_id,
                potential_duplicate_of: isDuplicate ? existingId : null
              })
              .select()
              .single();

            if (insertError) {
              throw Object.assign(new Error(`Failed to insert CV: ${insertError.message}`), {
                code: 'DB_ERROR'
              });
            }

            // Mark file as imported
            await markFileImported(supabase, file.id, cvSubmission.id);

            stats.succeeded++;
            circuitBreaker.onSuccess();
            rateLimiter.onSuccess();

            log('info', 'file_processed_success', session_id, {
              file_id: file.id,
              cv_submission_id: cvSubmission.id,
              parse_time_ms: parseTimeMs,
              cv_score: parsedData.cv_score
            });

          } catch (fileError: unknown) {
            const errorCategory = categorizeError(fileError);
            const errorMessage = fileError instanceof Error ? fileError.message : 'Unknown error';
            const newRetryCount = (file.retry_count || 0) + 1;

            log('error', 'file_processing_failed', session_id, {
              file_id: file.id,
              file_name: file.file_name,
              error: errorMessage,
              error_category: errorCategory,
              retry_count: newRetryCount
            });

            // Update error breakdown
            stats.errorBreakdown[errorCategory] = (stats.errorBreakdown[errorCategory] || 0) + 1;

            // Mark file as failed
            await markFileFailed(supabase, file.id, errorMessage, errorCategory, newRetryCount);

            stats.failed++;

            // Update circuit breaker
            circuitBreaker.onFailure(errorCategory);

            // Update rate limiter based on error type
            if (errorCategory === ErrorCategory.RATE_LIMIT) {
              rateLimiter.onRateLimit();
              // Extra wait for rate limits
              await sleep(2000);
            } else {
              rateLimiter.onError();
            }

            // Check if we should stop due to payment issues
            if (errorCategory === ErrorCategory.PAYMENT_REQUIRED) {
              log('error', 'payment_required_stopping', session_id);

              await supabase
                .from('bulk_import_sessions')
                .update({
                  status: 'failed',
                  error_message: 'Payment required - please add credits to continue',
                  completed_at: new Date().toISOString()
                })
                .eq('id', session_id);

              return;
            }
          }

          stats.processed++;
          context.processedCount++;
        }

        // Calculate average parse time
        const avgParseTimeMs = stats.parseTimesMs.length > 0
          ? stats.parseTimesMs.reduce((a, b) => a + b, 0) / stats.parseTimesMs.length
          : undefined;

        // Check if we need to schedule continuation
        const counts = await recomputeSessionCounts(supabase, session_id);
        const needsContinuation = counts.pendingCount > 0;

        log('info', 'batch_completed', session_id, {
          processed: stats.processed,
          succeeded: stats.succeeded,
          failed: stats.failed,
          skipped: stats.skipped,
          remaining_pending: counts.pendingCount,
          needs_continuation: needsContinuation,
          avg_parse_time_ms: avgParseTimeMs
        });

        // Update session with current progress
        await updateSessionProgress(
          supabase,
          session_id,
          stats.errorBreakdown,
          avgParseTimeMs
        );

        // Schedule continuation if needed
        if (needsContinuation && circuitBreaker.canExecute()) {
          const continued = await scheduleContinuation(supabase, session_id);
          log('info', 'continuation_scheduled', session_id, { success: continued });
        } else if (needsContinuation && !circuitBreaker.canExecute()) {
          log('warn', 'continuation_blocked_circuit_open', session_id, {
            cooldown_ms: circuitBreaker.getRemainingCooldownMs()
          });
        }

      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        log('error', 'processing_error', session_id, { error: errorMessage });

        await supabase
          .from('bulk_import_sessions')
          .update({
            status: 'failed',
            error_message: errorMessage,
            completed_at: new Date().toISOString()
          })
          .eq('id', session_id);
      }
    };

    // Start background processing
    (globalThis as unknown as { EdgeRuntime?: { waitUntil?: (promise: Promise<void>) => void } })
      .EdgeRuntime?.waitUntil?.(processFiles()) ?? processFiles();

    return response;

  } catch (error: unknown) {
    console.error('Error:', error);
    return errorResponse(
      error instanceof Error ? error.message : 'Unknown error',
      500
    );
  }
});
