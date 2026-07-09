/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getGeminiClient, Type } from "../lib/gemini.js";
import { sanitizeUserInput } from "../lib/sanitize.js";
import { StadiumState } from "../mocks/stadiumData.js";
import { runWithResilience, getAccessibilityFallback } from "../lib/resilience.js";

/**
 * Serves: Problem Statement Alignment (Accessibility, Multilingual Assistance), Code Quality, Accessibility
 * JSDoc: Accessibility Agent handles multilingual queries, routing around barriers, and WCAG AA guidelines.
 */

export interface AccessibilityAgentResponse {
  accessibleRoute: string;
  wheelchairFriendly: boolean;
  signageRating: "clear" | "obstructed" | "poor";
  translationIndicator: string; // e.g. "Spanish"
  translatedVoiceOutput: string; // The audio transcript text in the requested language
  tactileAlertRequired: boolean;
}

/**
 * Generates the highly contextual accessibility system prompt grounded in FIFA 2026.
 */
function createAccessibilityPrompt(
  queryText: string,
  targetLanguage: string,
  blockedSectors: string
): string {
  return `
You are the ACCESSIBILITY and MULTILINGUAL assistance system of "BALLIT" (the living stadium organism) at New York New Jersey Stadium for the FIFA World Cup 2026.
The user is querying you on a busy matchday in or requesting help in: ${targetLanguage}.
User Query: "${queryText}".

Current Obstructions Registered in Stadium Telemetry:
- ${blockedSectors || "All corridors, ramps, elevators, and wide lanes are currently CLEAR."}

Your mission:
1. Provide a step-by-step route and advice that completely bypasses any physical blockages.
2. Ensure the response is optimized for screen-readers and visual assistance.
3. Translate the core voice feedback response into the user's preferred language (${targetLanguage}) so that non-English speakers get direct vocal help in their native tongue.
4. Indicate whether tactile or haptic indicators are required at critical gates to guide the user safely.

Produce the output strictly in structured JSON.
`;
}

/**
 * Returns the Gemini Schema configuration for the Accessibility Agent.
 */
function getAccessibilitySchema() {
  return {
    type: Type.OBJECT,
    properties: {
      accessibleRoute: {
        type: Type.STRING,
        description: "A detailed, step-by-step path bypassing any obstructions and utilizing wide ramps or elevators.",
      },
      wheelchairFriendly: {
        type: Type.BOOLEAN,
        description: "True if the path is confirmed 100% flat/ramp/elevator accessible with zero stairs.",
      },
      signageRating: {
        type: Type.STRING,
        description: "Current accessibility signage quality rating near requested nodes: clear, obstructed, poor.",
      },
      translationIndicator: {
        type: Type.STRING,
        description: "The language this response is being translated/localized for.",
      },
      translatedVoiceOutput: {
        type: Type.STRING,
        description: "The precise text to be spoken, translated completely and naturally into the target language.",
      },
      tactileAlertRequired: {
        type: Type.BOOLEAN,
        description: "Whether a tactile warning pulse is required on the user's physical device to alert them of ramp slopes.",
      },
    },
    required: [
      "accessibleRoute",
      "wheelchairFriendly",
      "signageRating",
      "translationIndicator",
      "translatedVoiceOutput",
      "tactileAlertRequired",
    ],
  };
}

/**
 * Processes queries focusing on WCAG accessibility pathways, sensory needs, and translation.
 * @param query Fan request in their spoken/typed language
 * @param telemetry Current stadium telemetry
 * @param targetLanguage Target language name (e.g. "Spanish", "Portuguese", "Japanese")
 * @returns AccessibilityAgentResponse
 */
export async function runAccessibilityAgent(
  query: string,
  telemetry: StadiumState,
  targetLanguage = "English"
): Promise<AccessibilityAgentResponse> {
  const sanitizedQuery = sanitizeUserInput(query);

  const executeFn = async () => {
    const ai = getGeminiClient();

    // Find any active obstructions
    const blockedSectors = telemetry.nodes
      .filter((n) => n.accessibilityState === "obstructed")
      .map((n) => `${n.sector} (${n.concourse})`)
      .join(", ");

    const prompt = createAccessibilityPrompt(sanitizedQuery, targetLanguage, blockedSectors);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getAccessibilitySchema(),
      },
    });

    return JSON.parse(response.text?.trim() || "{}") as AccessibilityAgentResponse;
  };

  return runWithResilience(
    "Accessibility Agent",
    executeFn,
    () => getAccessibilityFallback(sanitizedQuery, telemetry, targetLanguage)
  );
}
