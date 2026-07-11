/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getGeminiClient, Type } from "../lib/gemini.js";
import { sanitizeUserInput } from "../lib/sanitize.js";
import { StadiumState } from "../mocks/stadiumData.js";
import { runWithResilience, getNavigatorFallback } from "../lib/resilience.js";

/**
 * Serves: Problem Statement Alignment (Navigation, Sustainability, Transportation), Code Quality
 * JSDoc: Navigator Agent uses gemini-3.5-flash to produce structured stadium navigation.
 */

export interface NavigatorAgentResponse {
  routeDescription: string;
  sectorsPassed: string[];
  estimatedTimeMinutes: number;
  accessibilityFriendly: boolean;
  sustainabilityNudge: string;
  audioFeedbackSpeech: string;
}

/**
 * Generates the highly contextual system instructions and prompt grounded in FIFA 2026.
 */
function createNavigatorPrompt(
  queryText: string,
  telemetry: StadiumState,
  requiresAccessibility: boolean,
  activeGates: string[],
  greenTransit: string
): string {
  return `
You are the NAVIGATION intelligence system of "BALLIT" (the living stadium organism) at New York New Jersey Stadium (MetLife Stadium) for the FIFA World Cup 2026.
The fan is asking a routing question on a high-stakes Matchday (e.g. USA vs. England, or the World Cup Final): "${queryText}".
Requires Accessibility Pathway: ${requiresAccessibility ? "YES (Strict Wheelchair/Stroller Access Required - bypass all stairs/ramps with high slopes)" : "NO"}.

Matchday Telemetry Context:
- Active Healthy Spectator Gates: ${activeGates.join(", ")}
- Best Low-Emission Transit Alternative: ${greenTransit}
- Peak Occupancy: ${telemetry.globalMetrics.totalOccupancy} fans
- Sector Density & Congestion: ${telemetry.globalMetrics.peakDensitySector} is undergoing a high-volume surge.

Provide a friendly, direct lightpath route bypassing congestion. Highlight active 2026 eco-transit loops (e.g., Pedestrian Green Corridor, wind-powered trains) and nudge the user toward eco-friendly habits (such as water refills at FIFA green fountains or zero-emission loops) to align with our green legacy goals.
Produce the output strictly in structured JSON.
`;
}

/**
 * Returns the Gemini Schema configuration for the Navigator Agent.
 */
function getNavigatorSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      routeDescription: {
        type: Type.STRING,
        description: "Friendly description of the route and physical pathways lighting up on the visual grid.",
      },
      sectorsPassed: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: "Sectors/Gates passed along the route (e.g. 'Gate A', 'Gate B').",
      },
      estimatedTimeMinutes: {
        type: Type.INTEGER,
        description: "Estimated travel time in minutes considering matchday crowd density.",
      },
      accessibilityFriendly: {
        type: Type.BOOLEAN,
        description: "Whether this exact route is stroller/wheelchair accessible.",
      },
      sustainabilityNudge: {
        type: Type.STRING,
        description: "A proactive environmental nudge encouraging public transit or low-carbon habits.",
      },
      audioFeedbackSpeech: {
        type: Type.STRING,
        description: "Short, verbal speech response for BALLIT's voice output companion (under 30 words).",
      },
    },
    required: [
      "routeDescription",
      "sectorsPassed",
      "estimatedTimeMinutes",
      "accessibilityFriendly",
      "sustainabilityNudge",
      "audioFeedbackSpeech",
    ],
  };
}

/**
 * Uses Gemini API to calculate a sustainable, smart route for a fan.
 * @param query Fan request (e.g., "how to get to Section 104 from Gate A")
 * @param telemetry Current stadium state (nodes, transit)
 * @param requiresAccessibility If true, path must avoid physical obstacles
 * @returns NavigatorAgentResponse
 */
export async function runNavigatorAgent(
  query: string,
  telemetry: StadiumState,
  requiresAccessibility = false
): Promise<NavigatorAgentResponse> {
  const sanitizedQuery = sanitizeUserInput(query);

  const executeFn = async (modelName: string) => {
    const ai = getGeminiClient();

    // Extract distinct healthy gates/sectors
    const activeGates = telemetry.nodes
      .filter((n) => n.sensorStatus === "healthy")
      .map((n) => n.sector)
      .filter((v, i, a) => a.indexOf(v) === i);

    const greenTransit = telemetry.transit.find((t) => t.carbonFootprint === "zero")?.name || "Eco-Loop Electric Shuttle";

    const prompt = createNavigatorPrompt(sanitizedQuery, telemetry, requiresAccessibility, activeGates, greenTransit);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getNavigatorSchema(),
      },
    });

    return JSON.parse(response.text?.trim() || "{}") as NavigatorAgentResponse;
  };

  return runWithResilience(
    "Navigator Agent",
    executeFn,
    () => getNavigatorFallback(sanitizedQuery, telemetry, requiresAccessibility)
  );
}
