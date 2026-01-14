/**
 * Adaptive Rate Limiter for robust API call management
 * Adjusts delay dynamically based on success/failure patterns
 */

export interface RateLimiterConfig {
  /** Initial delay between requests in milliseconds */
  initialDelayMs: number;
  /** Minimum delay in milliseconds */
  minDelayMs: number;
  /** Maximum delay in milliseconds */
  maxDelayMs: number;
  /** Factor to multiply delay on failure */
  backoffFactor: number;
  /** Factor to reduce delay on success */
  recoveryFactor: number;
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  initialDelayMs: 1500,
  minDelayMs: 500,
  maxDelayMs: 10000,
  backoffFactor: 2,
  recoveryFactor: 0.9
};

/**
 * Adaptive rate limiter that adjusts delay based on API responses
 */
export class AdaptiveRateLimiter {
  private config: RateLimiterConfig;
  private currentDelayMs: number;
  private consecutiveSuccesses: number;
  private consecutiveFailures: number;
  private lastRequestTime: number | null;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.currentDelayMs = this.config.initialDelayMs;
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures = 0;
    this.lastRequestTime = null;
  }

  /**
   * Get the current delay between requests
   */
  getCurrentDelay(): number {
    return this.currentDelayMs;
  }

  /**
   * Wait for the appropriate delay before next request
   */
  async waitForNextRequest(): Promise<void> {
    if (this.lastRequestTime !== null) {
      const elapsed = Date.now() - this.lastRequestTime;
      const remainingDelay = Math.max(0, this.currentDelayMs - elapsed);
      
      if (remainingDelay > 0) {
        await this.sleep(remainingDelay);
      }
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Record a successful request - may reduce delay
   */
  onSuccess(): void {
    this.consecutiveSuccesses++;
    this.consecutiveFailures = 0;

    // Reduce delay gradually after consecutive successes
    if (this.consecutiveSuccesses >= 3) {
      this.currentDelayMs = Math.max(
        this.config.minDelayMs,
        Math.round(this.currentDelayMs * this.config.recoveryFactor)
      );
      console.log(`[RateLimiter] Reducing delay to ${this.currentDelayMs}ms after ${this.consecutiveSuccesses} successes`);
    }
  }

  /**
   * Record a rate-limited or failed request - increases delay
   */
  onRateLimit(): void {
    this.consecutiveFailures++;
    this.consecutiveSuccesses = 0;

    this.currentDelayMs = Math.min(
      this.config.maxDelayMs,
      Math.round(this.currentDelayMs * this.config.backoffFactor)
    );
    console.log(`[RateLimiter] Increasing delay to ${this.currentDelayMs}ms after rate limit`);
  }

  /**
   * Record a non-rate-limit failure (doesn't affect timing as much)
   */
  onError(): void {
    this.consecutiveSuccesses = 0;
    // Slight increase on error, but not as aggressive as rate limit
    this.currentDelayMs = Math.min(
      this.config.maxDelayMs,
      Math.round(this.currentDelayMs * 1.2)
    );
  }

  /**
   * Reset to initial delay (e.g., at start of new batch)
   */
  reset(): void {
    this.currentDelayMs = this.config.initialDelayMs;
    this.consecutiveSuccesses = 0;
    this.consecutiveFailures = 0;
    this.lastRequestTime = null;
  }

  /**
   * Get statistics for monitoring
   */
  getStats(): {
    currentDelayMs: number;
    consecutiveSuccesses: number;
    consecutiveFailures: number;
  } {
    return {
      currentDelayMs: this.currentDelayMs,
      consecutiveSuccesses: this.consecutiveSuccesses,
      consecutiveFailures: this.consecutiveFailures
    };
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

/**
 * Calculate exponential backoff delay
 */
export function calculateBackoffDelay(
  attempt: number,
  baseDelayMs: number = 1000,
  maxDelayMs: number = 30000,
  jitterFactor: number = 0.1
): number {
  // Exponential backoff: 1s, 2s, 4s, 8s, ...
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt);
  
  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, maxDelayMs);
  
  // Add jitter to prevent thundering herd
  const jitter = cappedDelay * jitterFactor * (Math.random() - 0.5) * 2;
  
  return Math.round(cappedDelay + jitter);
}

/**
 * Utility to wait with timeout
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
