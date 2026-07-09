/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Serves: Code Quality, Accessibility
 * Global type definitions for the BALLIT stadium living organism dashboard.
 */

export type LensMode = "fan" | "volunteer" | "organizer";

export type StadiumScenario = "normal" | "pre-match-surge" | "half-time-exodus" | "post-match-egress";

export interface AgentResult {
  routeDescription?: string;
  sectorsPassed?: string[];
  estimatedTimeMinutes?: number;
  accessibilityFriendly?: boolean;
  sustainabilityNudge?: string;
  audioFeedbackSpeech?: string;

  // Crowd
  statusBrief?: string;
  overallDensityCategory?: string;
  gatePulses?: {
    gateId: string;
    pulseRate: number;
    crowdRating: string;
    volunteerGuidance: string;
  }[];

  // Incident
  alertsCount?: number;
  primaryIncident?: {
    id: string;
    title: string;
    severity: string;
    description: string;
    actionPlan: string;
  };
  allIncidentsSummary?: {
    sector: string;
    issueType: string;
    operationalBrief: string;
  }[];

  // Accessibility
  accessibleRoute?: string;
  wheelchairFriendly?: boolean;
  signageRating?: string;
  translationIndicator?: string;
  translatedVoiceOutput?: string;
  tactileAlertRequired?: boolean;
}
