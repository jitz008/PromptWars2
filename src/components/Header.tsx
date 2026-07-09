/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Activity, Clock, Globe, Eye, EyeOff } from "lucide-react";
import { StadiumScenario } from "../types.js";
import { LANGUAGES, STADIUM_NAME } from "../constants.js";

interface HeaderProps {
  scenario: StadiumScenario;
  setScenario: (sc: StadiumScenario) => void;
  selectedLanguage: string;
  setSelectedLanguage: (lang: string) => void;
  sensoryMode: boolean;
  setSensoryMode: (mode: boolean) => void;
  announceToScreenReader: (text: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  scenario,
  setScenario,
  selectedLanguage,
  setSelectedLanguage,
  sensoryMode,
  setSensoryMode,
  announceToScreenReader,
}) => {
  const handleSensoryToggle = () => {
    const nextMode = !sensoryMode;
    setSensoryMode(nextMode);
    announceToScreenReader(
      nextMode
        ? "Sensory mode active. Motion animations disabled."
        : "Interactive motion animations enabled."
    );
  };

  return (
    <header className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Logo Brand Title */}
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-950/60 border border-emerald-800 rounded-lg flex items-center justify-center">
            <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
          </div>
          <div>
            <h1 className="font-display font-bold text-2xl tracking-tight text-white flex items-center gap-2">
              BALLIT{" "}
              <span className="text-xs bg-emerald-950 text-emerald-400 border border-emerald-800/80 px-2 py-0.5 rounded font-mono font-medium">
                FIFA 2026
              </span>
            </h1>
            <p className="text-xs text-slate-400 font-mono tracking-wider">
              {STADIUM_NAME.toUpperCase()} LIVING CONTROL PLANE
            </p>
          </div>
        </div>

        {/* Quick-Access Configuration bar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Scenario selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="scenario-select"
              className="text-xs font-mono text-slate-400 flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5" /> telemetry:
            </label>
            <select
              id="scenario-select"
              value={scenario}
              onChange={(e) => setScenario(e.target.value as StadiumScenario)}
              className="bg-slate-900 border border-slate-800 text-xs rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-rose-500"
            >
              <option value="normal">Normal Flow (calm)</option>
              <option value="pre-match-surge">Pre-match Surge (Gate A)</option>
              <option value="half-time-exodus">Half-Time Exodus (Gate E)</option>
              <option value="post-match-egress">Post-match Egress (Gate G)</option>
            </select>
          </div>

          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <label
              htmlFor="language-select"
              className="text-xs font-mono text-slate-400 flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" /> Language:
            </label>
            <select
              id="language-select"
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-800 text-xs rounded px-2.5 py-1.5 text-white font-mono focus:outline-none focus:border-rose-500"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>
          </div>

          {/* WCAG AA Sensory Mode Trigger */}
          <button
            onClick={handleSensoryToggle}
            className={`flex items-center gap-1.5 text-xs font-mono px-3 py-1.5 rounded border transition-all ${
              sensoryMode
                ? "bg-rose-950/40 border-rose-800 text-rose-400"
                : "bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700"
            }`}
            title="Sensory mode toggles background pulse animations for accessibility"
            aria-label="Toggle sensory mode to reduce animations"
          >
            {sensoryMode ? (
              <EyeOff className="w-3.5 h-3.5" />
            ) : (
              <Eye className="w-3.5 h-3.5" />
            )}
            <span>Sensory Mode: {sensoryMode ? "Dampened" : "Full"}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
