/**
 * Circuit Breaker Pattern for robust error handling
 * Prevents cascading failures by stopping requests when services are failing
 */

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerConfig {
  /** Number of consecutive failures before opening the circuit */
  failureThreshold: number;
  /** Milliseconds to wait before trying again (half-open state) */
  resetTimeoutMs: number;
  /** Number of successful requests in half-open to close the circuit */
  successThreshold: number;
}

export interface CircuitBreakerState {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime: number | null;
  lastErrorCategory: string | null;
}

const DEFAULT_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,
  resetTimeoutMs: 30000, // 30 seconds
  successThreshold: 2
};

/**
 * Circuit Breaker implementation for bulk import processing
 */
export class CircuitBreaker {
  private config: CircuitBreakerConfig;
  private state: CircuitBreakerState;

  constructor(config: Partial<CircuitBreakerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.state = {
      state: 'closed',
      failures: 0,
      successes: 0,
      lastFailureTime: null,
      lastErrorCategory: null
    };
  }

  /**
   * Check if requests should be allowed through
   */
  canExecute(): boolean {
    if (this.state.state === 'closed') {
      return true;
    }

    if (this.state.state === 'open') {
      // Check if we should transition to half-open
      if (this.shouldTransitionToHalfOpen()) {
        this.state.state = 'half-open';
        this.state.successes = 0;
        console.log('[CircuitBreaker] Transitioning to half-open state');
        return true;
      }
      return false;
    }

    // Half-open: allow limited requests
    return true;
  }

  /**
   * Record a successful request
   */
  onSuccess(): void {
    if (this.state.state === 'half-open') {
      this.state.successes++;
      if (this.state.successes >= this.config.successThreshold) {
        this.close();
      }
    } else if (this.state.state === 'closed') {
      // Reset failure count on success
      this.state.failures = 0;
    }
  }

  /**
   * Record a failed request
   */
  onFailure(errorCategory?: string): void {
    this.state.failures++;
    this.state.lastFailureTime = Date.now();
    this.state.lastErrorCategory = errorCategory || null;

    if (this.state.state === 'half-open') {
      // Immediately open on any failure in half-open
      this.open();
    } else if (this.state.failures >= this.config.failureThreshold) {
      this.open();
    }
  }

  /**
   * Check if the circuit is open (blocking requests)
   */
  isOpen(): boolean {
    return this.state.state === 'open';
  }

  /**
   * Get current state for logging/monitoring
   */
  getState(): CircuitBreakerState {
    return { ...this.state };
  }

  /**
   * Get remaining cooldown time in milliseconds
   */
  getRemainingCooldownMs(): number {
    if (this.state.state !== 'open' || !this.state.lastFailureTime) {
      return 0;
    }
    const elapsed = Date.now() - this.state.lastFailureTime;
    return Math.max(0, this.config.resetTimeoutMs - elapsed);
  }

  /**
   * Force close the circuit (e.g., for manual recovery)
   */
  forceClose(): void {
    this.close();
  }

  private open(): void {
    console.log(`[CircuitBreaker] Opening circuit after ${this.state.failures} failures (last error: ${this.state.lastErrorCategory})`);
    this.state.state = 'open';
  }

  private close(): void {
    console.log('[CircuitBreaker] Closing circuit - service recovered');
    this.state.state = 'closed';
    this.state.failures = 0;
    this.state.successes = 0;
    this.state.lastFailureTime = null;
    this.state.lastErrorCategory = null;
  }

  private shouldTransitionToHalfOpen(): boolean {
    if (!this.state.lastFailureTime) return true;
    const elapsed = Date.now() - this.state.lastFailureTime;
    return elapsed >= this.config.resetTimeoutMs;
  }
}

/**
 * Error categories for circuit breaker decisions
 */
export const ErrorCategory = {
  RATE_LIMIT: 'RATE_LIMIT',
  PAYMENT_REQUIRED: 'PAYMENT_REQUIRED',
  FILE_ERROR: 'FILE_ERROR',
  AI_ERROR: 'AI_ERROR',
  PARSE_ERROR: 'PARSE_ERROR',
  DB_ERROR: 'DB_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  UNKNOWN: 'UNKNOWN'
} as const;

export type ErrorCategoryType = typeof ErrorCategory[keyof typeof ErrorCategory];

/**
 * Determine if an error is retryable based on category
 */
export function isRetryableError(category: ErrorCategoryType): boolean {
  return [
    ErrorCategory.RATE_LIMIT,
    ErrorCategory.NETWORK_ERROR,
    ErrorCategory.TIMEOUT,
    ErrorCategory.AI_ERROR
  ].includes(category);
}

/**
 * Categorize an error from its message or code
 */
export function categorizeError(error: unknown): ErrorCategoryType {
  if (!error) return ErrorCategory.UNKNOWN;

  const errorObj = error as { code?: string; message?: string; status?: number };
  const message = errorObj.message?.toLowerCase() || '';
  const code = errorObj.code?.toUpperCase() || '';
  const status = errorObj.status;

  // Check for known error types
  if (code === 'RATE_LIMIT' || status === 429 || message.includes('rate limit')) {
    return ErrorCategory.RATE_LIMIT;
  }
  if (code === 'PAYMENT_REQUIRED' || status === 402 || message.includes('payment')) {
    return ErrorCategory.PAYMENT_REQUIRED;
  }
  if (code === 'FILE_ERROR' || message.includes('file') || message.includes('download') || message.includes('storage')) {
    return ErrorCategory.FILE_ERROR;
  }
  if (code === 'PARSE_ERROR' || message.includes('parse') || message.includes('extract')) {
    return ErrorCategory.PARSE_ERROR;
  }
  if (code === 'TIMEOUT' || message.includes('timeout') || message.includes('timed out')) {
    return ErrorCategory.TIMEOUT;
  }
  if (code === 'NETWORK_ERROR' || message.includes('network') || message.includes('fetch')) {
    return ErrorCategory.NETWORK_ERROR;
  }
  if (message.includes('insert') || message.includes('constraint') || message.includes('database')) {
    return ErrorCategory.DB_ERROR;
  }
  if (code === 'AI_ERROR' || message.includes('ai') || message.includes('model')) {
    return ErrorCategory.AI_ERROR;
  }

  return ErrorCategory.UNKNOWN;
}
