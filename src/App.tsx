import React, { useState } from 'react';
import { 
  Shield, 
  Zap, 
  RotateCcw, 
  FileText, 
  Activity, 
  Sliders, 
  Users, 
  Flame, 
  Info,
  Check,
  Copy
} from 'lucide-react';
import { FootballTeamInput, MatchVariables, SimulationOutput } from './types';
import { DEFAULT_PRESET_CLUBS } from './data/footballTeams';
import { simulateRealisticFootballMatch } from './utils/footballEngine';
import { LineupBuilder } from './components/LineupBuilder';
import { MatchResultDisplay } from './components/MatchResultDisplay';

export function App() {
  const [teamA, setTeamA] = useState<FootballTeamInput>(JSON.parse(JSON.stringify(DEFAULT_PRESET_CLUBS[0]))); // Man City
  const [teamB, setTeamB] = useState<FootballTeamInput>(JSON.parse(JSON.stringify(DEFAULT_PRESET_CLUBS[1]))); // Real Madrid
  
  const [matchVars, setMatchVars] = useState<MatchVariables>({
    venue: 'Neutral',
    weather: 'Clear / Mild',
    refereeStrictness: 'Standard',
    extraTime: false,
  });

  const [matchResult, setMatchResult] = useState<SimulationOutput | null>(null);

  // Run simulation instantly
  const handleSimulate = () => {
    const output = simulateRealisticFootballMatch(teamA, teamB, matchVars);
    setMatchResult(output);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulateRematch = () => {
    const output = simulateRealisticFootballMatch(teamA, teamB, matchVars);
    setMatchResult(output);
  };

  const handleEditLineups = () => {
    setMatchResult(null);
  };

  // Quick Clashes
  const handleLoadMatchup = (idA: string, idB: string) => {
    const clubA = DEFAULT_PRESET_CLUBS.find(c => c.id === idA);
    const clubB = DEFAULT_PRESET_CLUBS.find(c => c.id === idB);
    if (clubA && clubB) {
      setTeamA(JSON.parse(JSON.stringify(clubA)));
      setTeamB(JSON.parse(JSON.stringify(clubB)));
      setMatchResult(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Header */}
      <header className="border-b border-slate-800/90 bg-slate-950/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
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
                  v2.0 Engine
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Unbiased, High-Realism Football Match Simulation Engine
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
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
                onClick={handleEditLineups}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
              >
                Edit Lineups
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        
        {/* Quick Matchup Presets Bar (shown on setup view) */}
        {!matchResult && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <span className="text-slate-500 font-bold text-[11px] uppercase tracking-wider whitespace-nowrap">
              Quick Clashes:
            </span>
            {[
              { label: 'Man City vs Real Madrid', idA: 'mci', idB: 'rma' },
              { label: 'El Clásico (Real vs Barca)', idA: 'rma', idB: 'bar' },
              { label: 'Arsenal vs Bayern', idA: 'ars', idB: 'bay' },
              { label: 'Liverpool vs Man City', idA: 'liv', idB: 'mci' },
            ].map((clash, idx) => (
              <button
                key={idx}
                onClick={() => handleLoadMatchup(clash.idA, clash.idB)}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 font-medium text-xs whitespace-nowrap transition-all"
              >
                {clash.label}
              </button>
            ))}
          </div>
        )}

        {/* Operational Constraints Banner */}
        <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 flex items-start gap-3 text-xs text-slate-400">
          <Info className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <span className="font-bold text-slate-200">Strict Operational Constraints Active:</span>
            <p className="leading-relaxed">
              No minute play-by-play commentary • Strict roster sanity (only provided players exist) • Absolute tactical privacy • Form & Gaussian variance weighting • Medical injury reporting.
            </p>
          </div>
        </div>

        {/* Content View: Lineup Builder OR Match Results Output */}
        {matchResult ? (
          <MatchResultDisplay
            result={matchResult}
            onSimulateRematch={handleSimulateRematch}
            onEditLineups={handleEditLineups}
          />
        ) : (
          <LineupBuilder
            teamA={teamA}
            teamB={teamB}
            matchVars={matchVars}
            onChangeTeamA={setTeamA}
            onChangeTeamB={setTeamB}
            onChangeMatchVars={setMatchVars}
            onSimulateMatch={handleSimulate}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-xs text-slate-500">
        Match Quick Simulátor • Pure Unbiased Football Simulation Engine
      </footer>

    </div>
  );
}

export default App;
