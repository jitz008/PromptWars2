/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getGeminiClient, Type } from "../lib/gemini.js";
import { StadiumState } from "../mocks/stadiumData.js";
import { runWithResilience, getCrowdFallback } from "../lib/resilience.js";

/**
 * Serves: Problem Statement Alignment (Crowd Management, Real-time Decision Support), Code Quality, Efficiency
 * JSDoc: Crowd Agent calculates real-time gate congestion and pulse rates for stadium operators.
 */

export interface GatePulse {
  gateId: string;
  pulseRate: number; // BPM (60 = calm, 140 = critical/congested)
  crowdRating: "clear" | "moderate" | "congested" | "overloaded";
  volunteerGuidance: string;
}

export interface CrowdAgentResponse {
  statusBrief: string;
  overallDensityCategory: "low" | "optimal" | "heavy" | "critical";
  gatePulses: GatePulse[];
}

/**
 * Creates the operator crowd analysis prompt grounded in FIFA 2026 Matchday dynamics.
 */
function createCrowdPrompt(condensedNodes: string, telemetry: StadiumState): string {
  return `
You are the CROWD FLOW and OPERATIONS engine of "BALLIT" (the living stadium organism) at MetLife Stadium for the FIFA World Cup 2026.
Analyze current raw match-day sensor telemetry and synthesize it into a clear status brief, an overall density rating, and detailed Gate pulse rates (where higher density causes faster, more rapid visual/haptic pulses in the operator's app).

Raw Telemetry (Sample):
${condensedNodes}

Global Indicators:
- System Health: ${telemetry.globalMetrics.systemHealthScore}/100
- Total Fans Present: ${telemetry.globalMetrics.totalOccupancy} (Matchday Capacity: 82,500)

For each main gate area (Gate A through H), calculate an operator's pulse rate (BPM) from 60 (empty/peaceful) up to 140 (extremely clogged, dangerous congestion during fan surge/exodus) and provide a tactical volunteer action command.
Produce the output in structured JSON.
`;
}

/**
 * Returns the Gemini Schema configuration for the Crowd Agent.
 */
function getCrowdSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      statusBrief: {
        type: Type.STRING,
        description: "A professional, scannable overview of current crowd flow dynamics and hot spots.",
      },
      overallDensityCategory: {
        type: Type.STRING,
        description: "The overall density status: low, optimal, heavy, critical.",
      },
      gatePulses: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            gateId: { type: Type.STRING, description: "Gate Name (e.g. 'Gate A', 'Gate G')." },
            pulseRate: { type: Type.INTEGER, description: "Recommended pulse rate in Beats-Per-Minute (60-140)." },
            crowdRating: { type: Type.STRING, description: "Rating of the gate area: clear, moderate, congested, overloaded." },
            volunteerGuidance: { type: Type.STRING, description: "Clear, immediate instructional command for field volunteers." },
          },
          required: ["gateId", "pulseRate", "crowdRating", "volunteerGuidance"],
        },
        description: "Dynamic visual pulse guidelines mapped to gate structures.",
      },
    },
    required: ["statusBrief", "overallDensityCategory", "gatePulses"],
  };
}

/**
 * Evaluates raw sensor data and maps to gate pulse parameters and volunteer instructions.
 * @param telemetry Raw stadium state
 * @returns CrowdAgentResponse
 */
export async function runCrowdAgent(telemetry: StadiumState): Promise<CrowdAgentResponse> {
  const executeFn = async (modelName: string) => {
    const ai = getGeminiClient();

    // Extract a compact telemetry string to stay efficient with tokens
    const condensedNodes = telemetry.nodes
      .map((node) => `${node.sector}-${node.concourse}: Density=${node.crowdDensity}, Flow=${node.flowRate}`)
      .slice(0, 12)
      .join("\n");

    const prompt = createCrowdPrompt(condensedNodes, telemetry);

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getCrowdSchema(),
      },
    });

    return JSON.parse(response.text?.trim() || "{}") as CrowdAgentResponse;
  };

  return runWithResilience(
    "Crowd Agent",
    executeFn,
    () => getCrowdFallback(telemetry)
  );
}
