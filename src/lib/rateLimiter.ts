/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Serves: Security, Efficiency, Testing
 * Simple in-memory Token-Bucket rate limiter to shield the Gemini server-side proxy
 * from abuse, high costs, and denial-of-service events.
 */

import { RATE_LIMIT_CAPACITY, RATE_LIMIT_REFILL_PER_SEC } from "../constants.js";

interface Bucket {
  tokens: number;
  lastRefilled: number; // timestamp in ms
}

export class TokenBucketRateLimiter {
  private buckets: Map<string, Bucket> = new Map();
  private maxCapacity: number;
  private refillRatePerMs: number; // tokens per ms

  /**
   * Initializes the Token-Bucket Rate Limiter.
   * @param capacity Maximum token burst capacity
   * @param refillRatePerSecond Number of tokens refilled every second
   */
  constructor(capacity = RATE_LIMIT_CAPACITY, refillRatePerSecond = RATE_LIMIT_REFILL_PER_SEC) {
    this.maxCapacity = capacity;
    this.refillRatePerMs = refillRatePerSecond / 1000;
  }

  /**
   * Evaluates if a request should be allowed or rate-limited.
   * @param clientId A unique identifier for the requester (e.g., session ID or IP)
   * @param cost The token cost of the request (default: 1)
   * @returns boolean - true if allowed, false if rate-limited
   */
  public allowRequest(clientId: string, cost = 1): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(clientId);

    if (!bucket) {
      // First-time user, initialize bucket to full capacity
      bucket = {
        tokens: this.maxCapacity,
        lastRefilled: now,
      };
      this.buckets.set(clientId, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsedMs = now - bucket.lastRefilled;
    const refilledTokens = elapsedMs * this.refillRatePerMs;
    
    bucket.tokens = Math.min(this.maxCapacity, bucket.tokens + refilledTokens);
    bucket.lastRefilled = now;

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return true;
    }

    return false;
  }

  /**
   * Manually resets a client's bucket (useful for testing or elevated admin sessions)
   */
  public resetClient(clientId: string): void {
    this.buckets.delete(clientId);
  }
}

// Global default rate limiter instance for convenience
export const globalGeminiRateLimiter = new TokenBucketRateLimiter(RATE_LIMIT_CAPACITY, RATE_LIMIT_REFILL_PER_SEC);
