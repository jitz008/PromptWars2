/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Serves: Code Quality, Problem Statement Alignment
 * Centralized constant values for the entire BALLIT Stadium Organism platform,
 * grounded in real New York New Jersey Stadium (MetLife Stadium) 2026 World Cup naming.
 */

// --- WORLD CUP 2026 STADIUM DATA ---
export const STADIUM_NAME = "New York New Jersey Stadium";
export const METLIFE_REPRESENTATION = "MetLife Stadium";

// Real sponsors/brand gates and specific seating naming at MetLife Stadium for the 2026 World Cup
export const SECTORS = [
  "Pepsi Gate (North)",
  "HCLTech Gate (Northeast)",
  "Verizon Gate (East)",
  "Bud Light Gate (Southeast)",
  "MetLife Gate (South)",
  "Snickers Gate (Southwest)",
  "Corona Gate (West)",
  "United Gate (Northwest)",
] as const;

export const CONCOURSES = [
  "Outer Plaza",
  "Lower Bowl",
  "Middle Tier",
  "Upper Bowl",
] as const;

// --- DEMOGRAPHIC & OPERATIONAL TELEMETRY ---
export const BASE_OCCUPANCY = 68000;
export const PRE_MATCH_OCCUPANCY = 78500;
export const HALF_TIME_OCCUPANCY = 82000;
export const POST_MATCH_OCCUPANCY = 81200;

export const HEALTH_DECAY_CRITICAL = 8;
export const HEALTH_DECAY_WARNING = 3;
export const HEALTH_DECAY_OBSTRUCTED = 12;

export const DEFAULT_HEALTH_SCORE = 100;
export const HEALTH_SCORE_MIN = 15;

export const DENSITY_MULTIPLIER_NORMAL = 1.0;
export const DENSITY_MULTIPLIER_PRE_MATCH = 1.3;
export const DENSITY_MULTIPLIER_HALF_TIME = 1.1;
export const DENSITY_MULTIPLIER_POST_MATCH = 1.4;

export const SECTOR_SURGE_PRE_MATCH = "Pepsi Gate (North)";
export const SECTOR_SURGE_HALF_TIME = "MetLife Gate (South)";
export const SECTOR_SURGE_POST_MATCH = "Corona Gate (West)";

// --- TRANSIT CONSTANTS ---
export const TRANSIT_ECO_LOOP_SHUTTLE = "Eco-Loop Electric Shuttle";
export const TRANSIT_MEADOWLANDS_EXPRESS = "Meadowlands Express Train";
export const TRANSIT_FIFA_EXPRESS_BUS = "FIFA Express Transit Bus";
export const TRANSIT_RIDESHARE = "Standard Rideshare App";
export const TRANSIT_GREEN_CORRIDOR = "Pedestrian Green Corridor";

// --- SANITIZATION CONSTANTS ---
export const MAX_INPUT_LENGTH = 300;
export const SAFE_INPUT_REGEX = /^[a-zA-Z0-9\s.,!?'"\-()$€£@]+$/;
export const INJECTION_BLACKLIST = [
  "system prompt",
  "ignore previous",
  "ignore above",
  "you must now",
  "you are now",
  "instead of",
  "disregard",
  "override",
  "developer mode",
  "sudo",
  "hack",
  "admin",
  "prompt injection",
] as const;

// --- RATE LIMIT CONSTANTS ---
export const RATE_LIMIT_CAPACITY = 8;
export const RATE_LIMIT_REFILL_PER_SEC = 0.33;

// --- MULTILINGUAL SUPPORT ---
export const LANGUAGES = [
  "English",
  "Spanish (Español)",
  "Portuguese (Português)",
  "French (Français)",
  "German (Deutsch)",
  "Japanese (日本語)",
  "Arabic (العربية)",
] as const;

export const LANG_LOCALE_MAP: Record<string, string> = {
  English: "en-US",
  "Spanish (Español)": "es-ES",
  "Portuguese (Português)": "pt-PT",
  "French (Français)": "fr-FR",
  "German (Deutsch)": "de-DE",
  "Japanese (日本語)": "ja-JP",
  "Arabic (العربية)": "ar-EG",
};

// --- ENDPOINTS ---
export const ENDPOINT_TELEMETRY = "/api/telemetry";
export const ENDPOINT_NAVIGATOR = "/api/agent/navigator";
export const ENDPOINT_CROWD = "/api/agent/crowd";
export const ENDPOINT_INCIDENT = "/api/agent/incident";
export const ENDPOINT_ACCESSIBILITY = "/api/agent/accessibility";
