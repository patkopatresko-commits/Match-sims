import React, { useState } from 'react';
import { 
  Zap, 
  Info,
} from 'lucide-react';
import { SimulationOutput } from './types';
import { simulateRealisticFootballMatch } from './utils/footballEngine';
import { parseMatchPrompt } from './utils/promptParser';
import { MatchResultDisplay } from './components/MatchResultDisplay';
import { PromptMatchInput } from './components/PromptMatchInput';

const DEFAULT_INITIAL_PROMPT = `Team A: Manchester City
Formation: 4-3-3
Tactics: High press, attacking mentality, direct high tempo, normal tackling
Lineup:
1. Ederson (GK) 88 OVR 7.2 form
2. Kyle Walker (DF) 84 OVR 6.9 form
3. Rúben Dias (DF) 89 OVR 7.8 form
4. Manuel Akanji (DF) 85 OVR 7.3 form
5. Josko Gvardiol (DF) 86 OVR 7.5 form
6. Rodri (MF) 91 OVR 8.4 form
7. Kevin De Bruyne (MF) 91 OVR 8.2 form
8. Bernardo Silva (MF) 88 OVR 7.9 form
9. Phil Foden (FW) 89 OVR 8.1 form
10. Erling Haaland (FW) 91 OVR 8.6 form
11. Jérémy Doku (FW) 83 OVR 7.4 form

Team B: Real Madrid
Formation: 4-3-1-2
Tactics: Attacking mentality, high tempo, mid block, normal tackling
Lineup:
1. Thibaut Courtois (GK) 90 OVR 8.0 form
2. Dani Carvajal (DF) 86 OVR 7.7 form
3. Éder Militão (DF) 86 OVR 7.4 form
4. Antonio Rüdiger (DF) 88 OVR 8.1 form
5. Ferland Mendy (DF) 83 OVR 7.2 form
6. Aurélien Tchouaméni (MF) 86 OVR 7.5 form
7. Federico Valverde (MF) 89 OVR 8.3 form
8. Eduardo Camavinga (MF) 85 OVR 7.6 form
9. Jude Bellingham (MF) 90 OVR 8.5 form
10. Kylian Mbappé (FW) 91 OVR 8.7 form
11. Vinícius Júnior (FW) 90 OVR 8.6 form

Venue: Neutral
Weather: Clear / Mild
Referee: Standard`;

export function App() {
  const [promptText, setPromptText] = useState<string>(DEFAULT_INITIAL_PROMPT);
  const [matchResult, setMatchResult] = useState<SimulationOutput | null>(null);

  // Simulate from Prompt
  const handleSimulate = () => {
    const parsed = parseMatchPrompt(promptText);
    const output = simulateRealisticFootballMatch(parsed.teamA, parsed.teamB, parsed.matchVars);
    setMatchResult(output);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulateRematch = () => {
    const parsed = parseMatchPrompt(promptText);
    const output = simulateRealisticFootballMatch(parsed.teamA, parsed.teamB, parsed.matchVars);
    setMatchResult(output);
  };

  const handleEditPrompt = () => {
    setMatchResult(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Header */}
      <header className="border-b border-slate-800/90 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-slate-950 font-black text-xl">
              ⚽
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">
                  Match Quick Simulátor
                </h1>
                <span className="text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  v2.1 Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Unbiased, High-Realism Football Match Simulation Engine
              </p>
            </div>
          </div>

          <div>
            {!matchResult ? (
              <button
                onClick={handleSimulate}
                className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs tracking-wide shadow-md flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>SIMULATE</span>
              </button>
            ) : (
              <button
                onClick={handleEditPrompt}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Edit Prompt
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-5">
        
        {/* Operational Constraints Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-200">Simulation Engine Active:</span>
            <p className="leading-relaxed">
              Processes any custom tactics, team names, and lineups. Generates the 6 required match result sections with absolute tactical privacy and zero narrative commentary.
            </p>
          </div>
        </div>

        {/* Dynamic View: Prompt Input OR Match Result */}
        {matchResult ? (
          <MatchResultDisplay
            result={matchResult}
            onSimulateRematch={handleSimulateRematch}
            onEditLineups={handleEditPrompt}
          />
        ) : (
          <PromptMatchInput
            promptText={promptText}
            onPromptChange={setPromptText}
            onSimulate={handleSimulate}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        Match Quick Simulátor • High-Realism Football Simulation Engine
      </footer>

    </div>
  );
}

export default App;
