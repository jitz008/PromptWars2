/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Mic, MicOff, Volume2, Navigation, Accessibility as AccIcon, Leaf, RefreshCw } from "lucide-react";
import { AgentResult } from "../types.js";

interface AmbientFanLensProps {
  fanQuery: string;
  setFanQuery: (q: string) => void;
  isListening: boolean;
  isSpeaking: boolean;
  agentLoading: boolean;
  agentResult: AgentResult | null;
  requiresAccRouting: boolean;
  setRequiresAccRouting: (v: boolean) => void;
  selectedLanguage: string;
  sensoryMode: boolean;
  healthStateString: string;
  toggleListening: () => void;
  stopSpeaking: () => void;
  onSubmit: (text?: string) => void;
}

export const AmbientFanLens: React.FC<AmbientFanLensProps> = ({
  fanQuery,
  setFanQuery,
  isListening,
  isSpeaking,
  agentLoading,
  agentResult,
  requiresAccRouting,
  setRequiresAccRouting,
  selectedLanguage,
  sensoryMode,
  healthStateString,
  toggleListening,
  stopSpeaking,
  onSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleShortcutClick = (queryText: string) => {
    setFanQuery(queryText);
    onSubmit(queryText);
  };

  const renderOrbInnerContent = () => {
    if (isListening) {
      return (
        <div className="text-rose-400 flex flex-col items-center gap-1.5">
          <MicOff className="w-8 h-8 animate-bounce" />
          <span className="text-[10px] font-mono tracking-widest uppercase">LISTENING...</span>
        </div>
      );
    }
    if (agentLoading) {
      return (
        <div className="text-rose-300 flex flex-col items-center gap-1.5">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="text-[10px] font-mono tracking-widest uppercase">CONJURING...</span>
        </div>
      );
    }
    if (isSpeaking) {
      return (
        <div className="text-emerald-300 flex flex-col items-center gap-1.5">
          <Volume2 className="w-10 h-10 animate-pulse" />
          <span className="text-[10px] font-mono tracking-widest uppercase">SPEAKING</span>
        </div>
      );
    }
    return (
      <div className="text-slate-400 flex flex-col items-center gap-1.5 group-hover:text-white">
        <Mic className="w-10 h-10 text-emerald-400" />
        <span className="text-xs font-medium font-display tracking-wide">Talk to BALLIT</span>
        <span className="text-[9px] font-mono text-slate-500">OR TYPED BELOW</span>
      </div>
    );
  };

  const renderSpeechSubtitle = () => {
    if (!isSpeaking || !agentResult) return null;
    const speechOutput = agentResult.translatedVoiceOutput || agentResult.audioFeedbackSpeech;
    if (!speechOutput) return null;

    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 inline-block max-w-md">
        <p className="text-sm font-display font-medium text-emerald-300 italic">
          "{speechOutput}"
        </p>
        <button
          onClick={stopSpeaking}
          className="mt-1 text-[10px] font-mono text-rose-400 underline cursor-pointer hover:text-rose-300"
        >
          Stop Audio Voice
        </button>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <h3 className="text-xs font-mono text-emerald-400 tracking-widest uppercase mb-6">
        Ambient Organism Response Conduit
      </h3>

      {/* Glowing Orb Sphere */}
      <div className="relative flex items-center justify-center my-8">
        {agentLoading && (
          <div className="absolute inset-[-20px] rounded-full border-2 border-dashed border-rose-500/50 animate-spin-slow"></div>
        )}

        <button
          onClick={toggleListening}
          className={`w-40 h-40 rounded-full flex flex-col items-center justify-center transition-all duration-500 relative z-10 select-none ${
            agentLoading
              ? "bg-rose-950 border-rose-500 border-4 scale-95"
              : isSpeaking
              ? "bg-emerald-950 border-emerald-400 border-4 scale-105"
              : "bg-slate-900 border-slate-800 border-2 hover:border-slate-700"
          } ${!sensoryMode ? healthStateString : ""}`}
          aria-label="Click to start voice companion consultation"
        >
          {renderOrbInnerContent()}
        </button>

        {isSpeaking && !sensoryMode && (
          <div className="absolute inset-[-40px] flex items-center justify-center pointer-events-none opacity-60">
            <svg viewBox="0 0 100 100" className="w-60 h-60 text-emerald-500">
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeDasharray="3 6"
                className="animate-spin"
              />
              <circle
                cx="50"
                cy="50"
                r="48"
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                strokeDasharray="5 15"
                className="animate-spin-slow"
              />
            </svg>
          </div>
        )}
      </div>

      {/* Faded speaking subtitles */}
      <div className="w-full text-center px-4 min-h-[40px] mt-2 mb-6">
        {renderSpeechSubtitle()}
      </div>

      {/* Ambient Console prompt query form */}
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-slate-900 border border-slate-800 focus-within:border-emerald-500 rounded-xl p-1.5 flex gap-2 transition-all mt-4"
      >
        <input
          type="text"
          placeholder={`Ask BALLIT in ${selectedLanguage}... (e.g. "elevator near Gate E?")`}
          value={fanQuery}
          onChange={(e) => setFanQuery(e.target.value)}
          className="bg-transparent flex-1 outline-none text-sm px-3 py-1.5 font-sans placeholder:text-slate-500 text-white"
        />

        <button
          type="submit"
          disabled={agentLoading}
          className="bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-mono font-bold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-all disabled:opacity-50"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>TRANSMIT</span>
        </button>
      </form>

      {/* Advanced Accessibility Routing Indicator */}
      <div className="mt-3 flex items-center gap-2">
        <input
          type="checkbox"
          id="acc-routing"
          checked={requiresAccRouting}
          onChange={(e) => setRequiresAccRouting(e.target.checked)}
          className="rounded border-slate-800 text-rose-500 focus:ring-rose-500 bg-slate-900"
        />
        <label
          htmlFor="acc-routing"
          className="text-xs text-slate-400 flex items-center gap-1 cursor-pointer"
        >
          <AccIcon className="w-3.5 h-3.5 text-rose-400" /> Ensure strict ADA accessibility corridor pathing
        </label>
      </div>

      {/* Fast interactive fan triggers (Zero-carbon shortcuts) */}
      <div className="flex flex-wrap gap-2 justify-center mt-6">
        <button
          type="button"
          onClick={() => handleShortcutClick("Fastest low carbon route to Gate G train station")}
          className="text-[11px] font-mono bg-slate-950 border border-slate-900 hover:border-emerald-800 px-3 py-1.5 rounded-full text-slate-400 hover:text-emerald-400 transition-all cursor-pointer flex items-center gap-1"
        >
          <Leaf className="w-3 h-3 text-emerald-500" /> Sustainable exit Gate G
        </button>
        <button
          type="button"
          onClick={() => handleShortcutClick("Where is elevator near Gate E obstruction?")}
          className="text-[11px] font-mono bg-slate-950 border border-slate-900 hover:border-rose-800 px-3 py-1.5 rounded-full text-slate-400 hover:text-rose-400 transition-all cursor-pointer flex items-center gap-1"
        >
          <AccIcon className="w-3 h-3 text-rose-500" /> Avoid Gate E stairs
        </button>
      </div>
    </div>
  );
};
