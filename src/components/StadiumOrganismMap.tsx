/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Heart } from "lucide-react";
import { LensMode, AgentResult } from "../types.js";
import { StadiumState, NerveNode } from "../mocks/stadiumData.js";

const SECTOR_ANGLES: Record<string, number> = {
  "Pepsi Gate (North)": -90,
  "HCLTech Gate (Northeast)": -45,
  "Verizon Gate (East)": 0,
  "Bud Light Gate (Southeast)": 45,
  "MetLife Gate (South)": 90,
  "Snickers Gate (Southwest)": 135,
  "Corona Gate (West)": 180,
  "United Gate (Northwest)": 225,
};

const CONCOURSE_RADII: Record<string, number> = {
  "Outer Plaza": 45,
  "Lower Bowl": 75,
  "Middle Tier": 105,
  "Upper Bowl": 135,
};

interface StadiumOrganismMapProps {
  telemetry: StadiumState | null;
  lensMode: LensMode;
  sensoryMode: boolean;
  agentResult: AgentResult | null;
  selectedNode: NerveNode | null;
  setSelectedNode: (node: NerveNode | null) => void;
  healthScore: number;
  isHealthy: boolean;
  isClogged: boolean;
}

export const StadiumOrganismMap: React.FC<StadiumOrganismMapProps> = ({
  telemetry,
  lensMode,
  sensoryMode,
  agentResult,
  selectedNode,
  setSelectedNode,
  healthScore,
  isHealthy,
  isClogged,
}) => {
  const renderConcourseCircles = () => {
    return Object.entries(CONCOURSE_RADII).map(([name, r]) => (
      <circle
        key={name}
        cx="160"
        cy="160"
        r={r}
        fill="none"
        stroke="#1e293b"
        strokeWidth="1"
        strokeDasharray="4 6"
      />
    ));
  };

  const renderSectorDividers = () => {
    return Object.entries(SECTOR_ANGLES).map(([name, angle]) => {
      const rad = (angle * Math.PI) / 180;
      const x2 = 160 + 150 * Math.cos(rad);
      const y2 = 160 + 150 * Math.sin(rad);
      return (
        <line
          key={name}
          x1="160"
          y1="160"
          x2={x2}
          y2={y2}
          stroke="#0f172a"
          strokeWidth="1.5"
        />
      );
    });
  };

  const renderRouteLightpaths = () => {
    if (lensMode !== "fan" || !agentResult?.sectorsPassed) return null;
    return (
      <g>
        {agentResult.sectorsPassed.map((secName) => {
          const angle = SECTOR_ANGLES[secName];
          if (angle === undefined) return null;
          const rad = (angle * Math.PI) / 180;
          const x2 = 160 + 140 * Math.cos(rad);
          const y2 = 160 + 140 * Math.sin(rad);
          return (
            <line
              key={secName}
              x1="160"
              y1="160"
              x2={x2}
              y2={y2}
              stroke="#38bdf8"
              strokeWidth="4"
              strokeLinecap="round"
              className="opacity-40 animate-pulse"
            />
          );
        })}
      </g>
    );
  };

  const renderNodeElement = (node: NerveNode) => {
    const angle = SECTOR_ANGLES[node.sector];
    const r = CONCOURSE_RADII[node.concourse];
    if (angle === undefined || r === undefined) return null;

    const rad = (angle * Math.PI) / 180;
    const x = 160 + r * Math.cos(rad);
    const y = 160 + r * Math.sin(rad);

    let fill = "#10b981";
    let rMultiplier = 1;
    if (node.sensorStatus === "critical") {
      fill = "#ef4444";
      rMultiplier = 1.3;
    } else if (node.sensorStatus === "warning") {
      fill = "#f59e0b";
    }

    const isObstructed = node.accessibilityState === "obstructed";
    const isSelected = selectedNode?.id === node.id;

    return (
      <g
        key={node.id}
        className="cursor-pointer"
        onClick={() => setSelectedNode(node)}
      >
        {isSelected && (
          <circle
            cx={x}
            cy={y}
            r={10}
            fill="none"
            stroke="#ff4e50"
            strokeWidth="2"
            className="animate-ping"
          />
        )}

        {isObstructed && (
          <circle
            cx={x}
            cy={y}
            r={8}
            fill="none"
            stroke="#38bdf8"
            strokeWidth="2.5"
          />
        )}

        <circle
          cx={x}
          cy={y}
          r={4 * rMultiplier}
          fill={fill}
          className={`${
            !sensoryMode && node.sensorStatus === "critical"
              ? "animate-pulse-fast"
              : !sensoryMode && node.sensorStatus === "warning"
              ? "animate-pulse-slow"
              : ""
          }`}
        />
      </g>
    );
  };

  const renderTelemetryInspector = () => {
    if (!selectedNode) {
      return (
        <div className="text-center py-4 text-slate-500 text-xs font-mono">
          Click any node point on the stadium map to explore real-time telemetry diagnostics.
        </div>
      );
    }

    return (
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="col-span-2 border-b border-slate-900 pb-1.5 flex justify-between items-center">
          <span className="font-display font-semibold text-white">
            {selectedNode.sector}
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            Node: {selectedNode.id}
          </span>
        </div>
        <div>
          <p className="text-slate-500 font-mono">Tier:</p>
          <p className="text-white font-medium">{selectedNode.concourse}</p>
        </div>
        <div>
          <p className="text-slate-500 font-mono">Crowd Density:</p>
          <p
            className={`font-semibold ${
              selectedNode.crowdDensity > 0.8
                ? "text-red-400"
                : selectedNode.crowdDensity > 0.6
                ? "text-amber-400"
                : "text-emerald-400"
            }`}
          >
            {(selectedNode.crowdDensity * 100).toFixed(0)}%
          </p>
        </div>
        <div>
          <p className="text-slate-500 font-mono">Flow Rate:</p>
          <p className="text-white font-medium">{selectedNode.flowRate} people/min</p>
        </div>
        <div>
          <p className="text-slate-500 font-mono">ADA Passage:</p>
          <p
            className={`font-semibold flex items-center gap-1 ${
              selectedNode.accessibilityState === "obstructed"
                ? "text-red-400"
                : "text-emerald-400"
            }`}
          >
            {selectedNode.accessibilityState === "obstructed" ? "OBSTRUCTED" : "CLEAR"}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-4">
        <div>
          <h3 className="text-xs font-mono text-rose-400 tracking-widest uppercase">
            Stadium Organism Neural Grid
          </h3>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">
            {lensMode === "volunteer"
              ? "Pulse rate (BPM) matches crowd density"
              : "Hover node for direct operational diagnostics"}
          </p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-mono bg-slate-950 text-slate-400 px-2.5 py-1 rounded border border-slate-900">
            Health Score:{" "}
            <span className={`font-bold ${isHealthy ? "text-emerald-400" : "text-amber-400"}`}>
              {healthScore}/100
            </span>
          </span>
        </div>
      </div>

      {/* Dynamic SVGs Stadium Map with 32 Neural Nodes */}
      <div className="relative w-full max-w-[340px] aspect-square flex items-center justify-center my-4 bg-slate-950/60 border border-slate-900 rounded-full p-4">
        <svg viewBox="0 0 320 320" className="w-full h-full text-slate-800 select-none">
          {renderConcourseCircles()}
          {renderSectorDividers()}
          {renderRouteLightpaths()}
          {telemetry?.nodes.map((node) => renderNodeElement(node))}
        </svg>

        {/* Legend centered in the physical map organism */}
        <div className="absolute w-20 h-20 rounded-full bg-slate-950 border border-slate-900 shadow-inner flex flex-col items-center justify-center">
          <Heart
            className={`w-6 h-6 ${
              isClogged ? "text-red-500 animate-ping" : "text-emerald-500 animate-pulse"
            }`}
          />
          <span className="text-[9px] font-mono text-slate-500">STADIUM</span>
        </div>
      </div>

      {/* Selected Node Inspector Detail panel */}
      <div className="w-full bg-slate-950/80 border border-slate-900 rounded-2xl p-4 mt-2">
        {renderTelemetryInspector()}
      </div>
    </div>
  );
};
