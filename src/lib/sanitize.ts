/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Serves: Security, Code Quality, Testing
 * Provides robust validation and sanitization of user-provided textual inputs.
 * Intended to run on the server side to neutralize potential prompt-injection attempts.
 */

import { MAX_INPUT_LENGTH, SAFE_INPUT_REGEX, INJECTION_BLACKLIST } from "../constants.js";

/**
 * Detects whether the input string contains any blacklisted prompt-injection phrases.
 */
function hasInjectionPattern(input: string): boolean {
  const lowerCaseInput = input.toLowerCase();
  return (INJECTION_BLACKLIST as readonly string[]).some((blockword) => lowerCaseInput.includes(blockword));
}

/**
 * Filter non-whitelisted characters, converting them to safe space character placeholders.
 */
function filterSafeCharacters(input: string): string {
  let cleanString = "";
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    cleanString += SAFE_INPUT_REGEX.test(char) ? char : " ";
  }
  return cleanString;
}

/**
 * Validates and sanitizes user input, returning a clean string or throwing/cleaning malicious elements.
 * @param input Raw text input from user (typed or voice transcript)
 * @returns Sanitized string safe for interpolation in Gemini system prompts
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

  // 3. Remove non-whitelisted characters and collapse whitespaces
  const filtered = filterSafeCharacters(trimmed);
  return filtered.replace(/\s+/g, " ").trim();
}
