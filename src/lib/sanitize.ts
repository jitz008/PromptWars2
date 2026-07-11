/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Serves: Security, Code Quality, Testing
 * Provides robust validation and sanitization of user-provided textual inputs.
 * Intended to run on the server side to neutralize potential prompt-injection attempts.
 */

import { MAX_INPUT_LENGTH, INJECTION_BLACKLIST } from "../constants.js";

/**
 * Allowlist of safe characters: letters/marks in any language (Unicode-aware),
 * numbers, common punctuation, and whitespace. This intentionally does NOT
 * use the global "g" flag, since a shared global regex tested repeatedly in a
 * loop silently corrupts results by advancing internal state between calls.
 */
const SAFE_CHAR_PATTERN = /[\p{L}\p{N}\p{M}\s.,!?'"()\-:;/]/u;

/**
 * Detects whether the input string contains any blacklisted prompt-injection
 * phrases. Normalizes whitespace and case first so simple spacing/casing
 * tricks don't trivially bypass the check.
 */
function hasInjectionPattern(input: string): boolean {
  const normalized = input.toLowerCase().replace(/\s+/g, " ").trim();
  return (INJECTION_BLACKLIST as readonly string[]).some((blockword) =>
    normalized.includes(blockword.toLowerCase())
  );
}

/**
 * Filters out characters not in the safe allowlist, replacing each with a
 * space. Unicode-aware, so accented characters (Spanish/French) and non-Latin
 * scripts (Japanese, etc.) are preserved instead of stripped — required for
 * the multilingual assistance feature to actually work.
 */
function filterSafeCharacters(input: string): string {
  let cleanString = "";
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    cleanString += SAFE_CHAR_PATTERN.test(char) ? char : " ";
  }
  return cleanString;
}

/**
 * Validates and sanitizes user input, returning a clean string safe for
 * interpolation in Gemini system prompts.
 * @param input Raw text input from user (typed or voice transcript)
 * @returns Sanitized string
 */
export function sanitizeUserInput(input: string): string {
  if (!input) return "";

  // 1. Enforce strict character limits
  let trimmed = input.trim();
  if (trimmed.length > MAX_INPUT_LENGTH) {
    trimmed = trimmed.substring(0, MAX_INPUT_LENGTH);
  }

  // 2. Scan for malicious injection phrases
  if (hasInjectionPattern(trimmed)) {
    return "[Malicious prompt-injection attempt detected and neutralized. Safe request: Tell me how to navigate to my seat.]";
  }

  // 3. Remove non-whitelisted characters and collapse whitespace
  const filtered = filterSafeCharacters(trimmed);
  return filtered.replace(/\s+/g, " ").trim();
}