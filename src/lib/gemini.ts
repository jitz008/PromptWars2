/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI } from "@google/genai";

/**
 * Serves: Security, Code Quality, Efficiency
 * Handles the secure, lazy-initialization of the Google GenAI SDK.
 * Prevents system startup failures by keeping the client in a local closure
 * and throwing helpful errors if the environment key is omitted.
 */

let aiClient: GoogleGenAI | null = null;

/**
 * Returns a configured, authenticated instance of GoogleGenAI.
 * Throws a clear error if the API key environment variable is not set.
 */
export function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "Missing GEMINI_API_KEY environment variable. " +
        "Please provide your API key in the Settings > Secrets menu of Google AI Studio."
      );
    }

    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}
export { Type } from "@google/genai";
