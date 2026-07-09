/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { getGeminiClient, Type } from "../lib/gemini.js";
import { StadiumState } from "../mocks/stadiumData.js";
import { runWithResilience, getIncidentFallback } from "../lib/resilience.js";

/**
 * Serves: Problem Statement Alignment (Operational Intelligence, Real-time Decision Support), Code Quality, Efficiency
 * JSDoc: Incident Agent generates high-level operational briefs for stadium commanders and organizers.
 */

export interface IncidentBrief {
  id: string;
  title: string;
  severity: "low" | "medium" | "high" | "critical";
  description: string;
  actionPlan: string;
}

export interface IncidentAgentResponse {
  alertsCount: number;
  primaryIncident: IncidentBrief;
  allIncidentsSummary: {
    sector: string;
    issueType: string;
    operationalBrief: string;
  }[];
}

/**
 * Generates the incident command prompt grounded in FIFA 2026.
 */
function createIncidentPrompt(anomalyNodes: string, telemetry: StadiumState): string {
  return `
You are the INCIDENT COMMAND and DISPATCH intelligence of "BALLIT" (the living stadium organism) at MetLife Stadium for the FIFA World Cup 2026.
Analyze stadium anomalies on this matchday and synthesize them into natural-language incident briefs with actionable dispatch suggestions for security and operational squads.

Anomalies Detected:
${anomalyNodes || "No severe sensor anomalies or accessibility blockages reported currently."}

Global Metrics:
- Current Stadium Health Score: ${telemetry.globalMetrics.systemHealthScore}/100
- Active Anomaly Regions: ${telemetry.globalMetrics.activeIncidents}

Synthesize a single 'primaryIncident' that demands immediate command-center dispatch, and summarize the other active anomalies into clear 'operationalBrief' rows.
Produce the output strictly in structured JSON.
`;
}

/**
 * Returns the Gemini Schema configuration for the Incident Agent.
 */
function getIncidentSchema() {
  return {
    type: Type.OBJECT,
    properties: {
      alertsCount: {
        type: Type.INTEGER,
        description: "Number of currently active operational alerts.",
      },
      primaryIncident: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING, description: "Unique incident index code (e.g. 'INC-904')." },
          title: { type: Type.STRING, description: "Short descriptive title of the primary issue." },
          severity: { type: Type.STRING, description: "Issue severity: low, medium, high, critical." },
          description: { type: Type.STRING, description: "Full natural-language briefing of what is happening." },
          actionPlan: { type: Type.STRING, description: "Specific, step-by-step dispatch action for command organizers." },
        },
        required: ["id", "title", "severity", "description", "actionPlan"],
        description: "The most severe incident requiring active command attention.",
      },
      allIncidentsSummary: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            sector: { type: Type.STRING, description: "Sector/Gate name." },
            issueType: { type: Type.STRING, description: "E.g., 'Crowd Surge', 'Accessibility Barrier', 'Translation Failure Hotspot'." },
            operationalBrief: { type: Type.STRING, description: "A highly condensed operations summary." },
          },
          required: ["sector", "issueType", "operationalBrief"],
        },
        description: "A summary log of all secondary anomalies.",
      },
    },
    required: ["alertsCount", "primaryIncident", "allIncidentsSummary"],
  };
}

/**
 * Runs the incident generator using Gemini to translate telemetry alerts into actionable briefs.
 * @param telemetry Stadium state
 * @returns IncidentAgentResponse
 */
export async function runIncidentAgent(telemetry: StadiumState): Promise<IncidentAgentResponse> {
  const executeFn = async () => {
    const ai = getGeminiClient();

    // Pick nodes with warning or critical status
    const anomalyNodes = telemetry.nodes
      .filter((n) => n.sensorStatus !== "healthy" || n.accessibilityState === "obstructed")
      .map((n) => `${n.sector} - ${n.concourse}: Status=${n.sensorStatus}, Access=${n.accessibilityState}`)
      .join("\n");

    const prompt = createIncidentPrompt(anomalyNodes, telemetry);

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: getIncidentSchema(),
      },
    });

    return JSON.parse(response.text?.trim() || "{}") as IncidentAgentResponse;
  };

  return runWithResilience(
    "Incident Agent",
    executeFn,
    () => getIncidentFallback(telemetry)
  );
}
