/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Navigation, Accessibility as AccIcon, Leaf, TrendingUp, Flame } from "lucide-react";
import { LensMode, AgentResult } from "../types.js";

interface ActiveAgentResultsProps {
  lensMode: LensMode;
  agentResult: AgentResult;
}

export const ActiveAgentResults: React.FC<ActiveAgentResultsProps> = ({
  lensMode,
  agentResult,
}) => {
  const renderSectorsPassed = (sectors: string[]) => {
    return (
      <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-slate-900/50">
        {sectors.map((sec) => (
          <span
            key={sec}
            className="text-[10px] font-mono bg-slate-950 px-2 py-0.5 rounded text-sky-300 border border-slate-900"
          >
            {sec}
          </span>
        ))}
      </div>
    );
  };

  const renderFanRoute = () => {
    return (
      <div className="space-y-4">
        {agentResult.routeDescription && (
          <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-4">
            <h4 className="text-xs font-mono text-sky-400 uppercase tracking-widest mb-2 flex items-center gap-1">
              <Navigation className="w-3.5 h-3.5" /> Calculated lightpath route
            </h4>
            <p className="text-sm leading-relaxed text-slate-200">
              {agentResult.routeDescription}
            </p>
            {agentResult.sectorsPassed && renderSectorsPassed(agentResult.sectorsPassed)}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3">
            <p className="text-slate-500 font-mono">Travel Duration:</p>
            <p className="text-lg font-bold text-white font-display mt-1">
              {agentResult.estimatedTimeMinutes || 8} min
            </p>
          </div>
          <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-3">
            <p className="text-slate-500 font-mono">ADA Compliant Corridor:</p>
            <p
              className={`text-sm font-bold mt-1.5 flex items-center gap-1 ${
                agentResult.accessibilityFriendly || agentResult.wheelchairFriendly
                  ? "text-emerald-400"
                  : "text-amber-400"
              }`}
            >
              <AccIcon className="w-4 h-4" />{" "}
              {agentResult.accessibilityFriendly || agentResult.wheelchairFriendly
                ? "ACCESSIBLE"
                : "STANDARD PATH"}
            </p>
          </div>
        </div>

        {agentResult.sustainabilityNudge && (
          <div className="bg-emerald-950/30 border border-emerald-900/60 rounded-2xl p-4 flex gap-3 items-start">
            <Leaf className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">
                BALLIT Green Corridor Nudge
              </h4>
              <p className="text-xs leading-relaxed text-emerald-200 mt-1 font-sans">
                {agentResult.sustainabilityNudge}
              </p>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderGatePulseItem = (gp: {
    gateId: string;
    pulseRate: number;
    crowdRating: string;
    volunteerGuidance: string;
  }) => {
    const isSevere = gp.pulseRate >= 120;
    const isWarning = gp.pulseRate >= 90 && gp.pulseRate < 120;
    const pulseColor = isSevere ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400";
    const pulseSpeedClass = gp.pulseRate > 110 ? "animate-ping" : gp.pulseRate > 80 ? "animate-pulse" : "";

    return (
      <div
        key={gp.gateId}
        className="bg-slate-950 p-2.5 rounded-xl border border-slate-900 flex flex-col gap-1 text-xs"
      >
        <div className="flex items-center justify-between">
          <span className="font-display font-semibold text-white">{gp.gateId}</span>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[10px] text-slate-500">Pulse:</span>
            <span className={`font-mono font-bold flex items-center gap-1 ${pulseColor}`}>
              <span className={`w-1.5 h-1.5 rounded-full bg-current ${pulseSpeedClass}`}></span>
              {gp.pulseRate} BPM
            </span>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 leading-normal italic mt-0.5">
          "{gp.volunteerGuidance}"
        </p>
      </div>
    );
  };

  const renderVolunteerFeed = () => {
    return (
      <div className="space-y-4">
        {agentResult.statusBrief && (
          <div className="bg-slate-900/60 border border-slate-900 rounded-2xl p-4">
            <h4 className="text-xs font-mono text-rose-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> OPERATIONAL CROWD NARRATIVE
            </h4>
            <p className="text-xs leading-relaxed text-slate-300">{agentResult.statusBrief}</p>
          </div>
        )}

        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-3">
            VOLUNTEER COMMAND FEED (TACTILE PULSE VECTORS)
          </h4>
          <div className="space-y-2.5 max-h-[180px] overflow-y-auto pr-1">
            {agentResult.gatePulses?.map((gp) => renderGatePulseItem(gp))}
          </div>
        </div>
      </div>
    );
  };

  const renderSecondaryAnomalyRow = (
    item: { sector: string; issueType: string; operationalBrief: string },
    idx: number
  ) => {
    return (
      <div
        key={idx}
        className="p-2 bg-slate-950 rounded-lg border border-slate-900 flex justify-between items-start gap-4 text-[11px]"
      >
        <div>
          <span className="font-display font-semibold text-white">{item.sector}</span>
          <span className="mx-1 text-slate-600 font-mono">•</span>
          <span className="text-amber-400 font-mono">{item.issueType}</span>
          <p className="text-slate-400 leading-normal mt-0.5">{item.operationalBrief}</p>
        </div>
      </div>
    );
  };

  const renderOrganizerBrief = () => {
    return (
      <div className="space-y-4">
        {agentResult.primaryIncident && (
          <div className="bg-red-950/40 border border-red-800/80 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-red-900/50">
              <h4 className="text-xs font-mono text-red-400 uppercase tracking-wider font-bold flex items-center gap-1">
                <Flame className="w-4 h-4 text-red-500" /> Primary Command incident
              </h4>
              <span className="text-[10px] font-mono bg-red-900 text-white px-2 py-0.5 rounded font-bold">
                {agentResult.primaryIncident.severity.toUpperCase()}
              </span>
            </div>
            <h5 className="font-display font-bold text-sm text-white">
              {agentResult.primaryIncident.title}
            </h5>
            <p className="text-xs leading-relaxed text-red-200 mt-1.5">
              {agentResult.primaryIncident.description}
            </p>

            <div className="mt-3 bg-slate-950 p-3 rounded-xl border border-red-900/50">
              <p className="text-[10px] font-mono text-slate-500">DISPATCH RESOLUTION PLAN:</p>
              <p className="text-xs leading-relaxed text-white mt-1">
                {agentResult.primaryIncident.actionPlan}
              </p>
            </div>
          </div>
        )}

        <div className="bg-slate-900/40 border border-slate-900 rounded-2xl p-4">
          <h4 className="text-xs font-mono text-slate-400 uppercase tracking-widest mb-2.5">
            SECONDARY ORGANS ANOMALIES LOG
          </h4>
          <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
            {agentResult.allIncidentsSummary?.map((item, idx) =>
              renderSecondaryAnomalyRow(item, idx)
            )}
          </div>
        </div>
      </div>
    );
  };

  if (lensMode === "fan") return renderFanRoute();
  if (lensMode === "volunteer") return renderVolunteerFeed();
  if (lensMode === "organizer") return renderOrganizerBrief();
  return null;
};
