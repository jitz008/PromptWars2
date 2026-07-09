/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Leaf, Clock } from "lucide-react";
import { StadiumState } from "../mocks/stadiumData.js";

interface ActiveTransitOptionsProps {
  telemetry: StadiumState | null;
}

export const ActiveTransitOptions: React.FC<ActiveTransitOptionsProps> = ({ telemetry }) => {
  if (!telemetry) return null;

  return (
    <div className="mt-4 pt-4 border-t border-slate-900">
      <h4 className="text-[11px] font-mono text-slate-500 uppercase tracking-widest mb-2.5 flex items-center gap-1">
        <Leaf className="w-3.5 h-3.5 text-emerald-500" /> Active 2026 Transit & Sustainability vectors
      </h4>
      <div className="grid grid-cols-1 gap-2">
        {telemetry.transit.map((t) => {
          const isEco = t.carbonFootprint === "zero";
          return (
            <div
              key={t.name}
              className="bg-slate-900/30 hover:bg-slate-900/50 border border-slate-900 p-2.5 rounded-xl flex items-start gap-2.5 text-xs transition-all"
            >
              {isEco ? (
                <Leaf className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0 animate-pulse" />
              ) : (
                <Clock className="w-4 h-4 text-sky-400 mt-0.5 flex-shrink-0" />
              )}
              <div className="flex-1">
                <div className="flex justify-between items-center">
                  <span className="font-display font-medium text-white">{t.name}</span>
                  <span className="font-mono text-[10px] text-slate-400">ETA: {t.etaMinutes}m</span>
                </div>
                <p className="text-[10px] text-slate-500 leading-normal mt-0.5">
                  {t.sustainabilityNudge}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
