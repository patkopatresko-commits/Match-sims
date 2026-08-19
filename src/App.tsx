import React, { useState } from 'react';
import { 
  Zap, 
  Info,
} from 'lucide-react';
import { SimulationOutput } from './types';
import { simulateRealisticFootballMatch } from './utils/footballEngine';
import { 
  MatchSetupInput, 
  ValidationErrors, 
  validateMatchSetup, 
  buildTeamsFromSetup 
} from './utils/fieldParser';
import { MatchResultDisplay } from './components/MatchResultDisplay';
import { PromptMatchInput } from './components/PromptMatchInput';

const PRESETS: Record<string, MatchSetupInput> = {
  mci_rma: {
    teamA: {
      name: 'Manchester City',
      playersText: `1. Ederson (GK) 88 OVR 7.2 form
2. Kyle Walker (DF) 84 OVR 6.9 form
3. Rúben Dias (DF) 89 OVR 7.8 form
4. Manuel Akanji (DF) 85 OVR 7.3 form
5. Josko Gvardiol (DF) 86 OVR 7.5 form
6. Rodri (MF) 91 OVR 8.4 form
7. Kevin De Bruyne (MF) 91 OVR 8.2 form
8. Bernardo Silva (MF) 88 OVR 7.9 form
9. Phil Foden (FW) 89 OVR 8.1 form
10. Erling Haaland (FW) 91 OVR 8.6 form
11. Jérémy Doku (FW) 83 OVR 7.4 form`,
      tacticalInstructions: 'Formation: 4-3-3. High press, attacking mentality, direct high tempo, normal tackling',
    },
    teamB: {
      name: 'Real Madrid',
      playersText: `1. Thibaut Courtois (GK) 90 OVR 8.0 form
2. Dani Carvajal (DF) 86 OVR 7.7 form
3. Éder Militão (DF) 86 OVR 7.4 form
4. Antonio Rüdiger (DF) 88 OVR 8.1 form
5. Ferland Mendy (DF) 83 OVR 7.2 form
6. Aurélien Tchouaméni (MF) 86 OVR 7.5 form
7. Federico Valverde (MF) 89 OVR 8.3 form
8. Eduardo Camavinga (MF) 85 OVR 7.6 form
9. Jude Bellingham (MF) 90 OVR 8.5 form
10. Kylian Mbappé (FW) 91 OVR 8.7 form
11. Vinícius Júnior (FW) 90 OVR 8.6 form`,
      tacticalInstructions: 'Formation: 4-3-1-2. Attacking mentality, high tempo, mid block, normal tackling',
    },
    matchVars: {
      venue: 'Neutral',
      weather: 'Clear / Mild',
      refereeStrictness: 'Standard',
      extraTime: false,
    }
  },
  ars_liv: {
    teamA: {
      name: 'Arsenal',
      playersText: `1. David Raya (GK) 86 OVR 7.8 form
2. Ben White (DF) 85 OVR 7.5 form
3. William Saliba (DF) 89 OVR 8.2 form
4. Gabriel Magalhães (DF) 87 OVR 7.9 form
5. Jurriën Timber (DF) 83 OVR 7.4 form
6. Thomas Partey (MF) 84 OVR 7.2 form
7. Declan Rice (MF) 88 OVR 8.1 form
8. Martin Ødegaard (MF) 89 OVR 8.3 form
9. Bukayo Saka (FW) 88 OVR 8.4 form
10. Kai Havertz (FW) 85 OVR 7.7 form
11. Gabriel Martinelli (FW) 85 OVR 7.5 form`,
      tacticalInstructions: 'Formation: 4-3-3. High press & counter-press, attacking mentality, direct tempo, normal tackling',
    },
    teamB: {
      name: 'Liverpool',
      playersText: `1. Alisson Becker (GK) 89 OVR 8.1 form
2. Trent Alexander-Arnold (DF) 87 OVR 8.0 form
3. Ibrahima Konaté (DF) 85 OVR 7.6 form
4. Virgil van Dijk (DF) 90 OVR 8.4 form
5. Andy Robertson (DF) 85 OVR 7.5 form
6. Ryan Gravenberch (MF) 84 OVR 7.9 form
7. Alexis Mac Allister (MF) 86 OVR 7.8 form
8. Dominik Szoboszlai (MF) 85 OVR 7.6 form
9. Mohamed Salah (FW) 90 OVR 8.5 form
10. Diogo Jota (FW) 85 OVR 7.7 form
11. Luis Díaz (FW) 86 OVR 8.0 form`,
      tacticalInstructions: 'Formation: 4-2-3-1. Gegenpress, high tempo, direct attacking, aggressive tackling',
    },
    matchVars: {
      venue: 'Neutral',
      weather: 'Clear / Mild',
      refereeStrictness: 'Standard',
      extraTime: false,
    }
  },
  bar_bay: {
    teamA: {
      name: 'FC Barcelona',
      playersText: `1. Marc-André ter Stegen (GK) 88 OVR 7.6 form
2. Jules Koundé (DF) 86 OVR 7.9 form
3. Pau Cubarsí (DF) 82 OVR 7.7 form
4. Iñigo Martínez (DF) 83 OVR 7.4 form
5. Alejandro Balde (DF) 83 OVR 7.5 form
6. Marc Casadó (MF) 81 OVR 7.8 form
7. Pedri (MF) 88 OVR 8.3 form
8. Dani Olmo (MF) 86 OVR 8.0 form
9. Lamine Yamal (FW) 87 OVR 8.6 form
10. Robert Lewandowski (FW) 89 OVR 8.4 form
11. Raphinha (FW) 87 OVR 8.5 form`,
      tacticalInstructions: 'Formation: 4-3-3. High defensive line, attacking mentality, possession tempo, normal tackling',
    },
    teamB: {
      name: 'Bayern Munich',
      playersText: `1. Manuel Neuer (GK) 88 OVR 7.7 form
2. Joshua Kimmich (DF) 88 OVR 8.0 form
3. Dayot Upamecano (DF) 84 OVR 7.3 form
4. Min-jae Kim (DF) 85 OVR 7.5 form
5. Alphonso Davies (DF) 85 OVR 7.8 form
6. João Palhinha (MF) 85 OVR 7.6 form
7. Aleksandar Pavlović (MF) 82 OVR 7.7 form
8. Jamal Musiala (MF) 89 OVR 8.5 form
9. Michael Olise (FW) 85 OVR 8.1 form
10. Harry Kane (FW) 90 OVR 8.6 form
11. Serge Gnabry (FW) 84 OVR 7.4 form`,
      tacticalInstructions: 'Formation: 4-2-3-1. High pressing, attacking mentality, fast pace direct tempo',
    },
    matchVars: {
      venue: 'Neutral',
      weather: 'Clear / Mild',
      refereeStrictness: 'Standard',
      extraTime: false,
    }
  }
};

export function App() {
  const [setup, setSetup] = useState<MatchSetupInput>(PRESETS.mci_rma);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [matchResult, setMatchResult] = useState<SimulationOutput | null>(null);

  // Validate and Simulate
  const handleSimulate = () => {
    const { isValid, errors: validationErrors } = validateMatchSetup(setup);
    
    if (!isValid) {
      setErrors(validationErrors);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Clear errors if valid
    setErrors({});

    // Build teams strictly from separate fields
    const { teamA, teamB } = buildTeamsFromSetup(setup);
    const output = simulateRealisticFootballMatch(teamA, teamB, setup.matchVars);
    
    setMatchResult(output);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSimulateRematch = () => {
    const { teamA, teamB } = buildTeamsFromSetup(setup);
    const output = simulateRealisticFootballMatch(teamA, teamB, setup.matchVars);
    setMatchResult(output);
  };

  const handleEditSetup = () => {
    setMatchResult(null);
  };

  const handleLoadPreset = (presetKey: string) => {
    if (PRESETS[presetKey]) {
      setSetup(PRESETS[presetKey]);
      setErrors({});
    }
  };

  const handleReset = () => {
    setSetup({
      teamA: { name: '', playersText: '', tacticalInstructions: '' },
      teamB: { name: '', playersText: '', tacticalInstructions: '' },
      matchVars: { venue: 'Neutral', weather: 'Clear / Mild', refereeStrictness: 'Standard', extraTime: false },
    });
    setErrors({});
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
                  Strict Fields v3.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Independent Field Inputs • Strict 11-Player Validation • Absolute Tactical Isolation
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
                onClick={handleEditSetup}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all cursor-pointer"
              >
                Edit Setup
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
            <span className="font-bold text-slate-200">Strict Field Separation Active:</span>
            <p className="leading-relaxed">
              Team names come strictly from team name inputs. Player lists require exactly 11 valid lines (empty lines ignored). Tactical instructions are isolated and never mix with players or team names.
            </p>
          </div>
        </div>

        {/* Dynamic View: Setup Form OR Match Result */}
        {matchResult ? (
          <MatchResultDisplay
            result={matchResult}
            onSimulateRematch={handleSimulateRematch}
            onEditLineups={handleEditSetup}
          />
        ) : (
          <PromptMatchInput
            setup={setup}
            errors={errors}
            onSetupChange={setSetup}
            onSimulate={handleSimulate}
            onLoadPreset={handleLoadPreset}
            onReset={handleReset}
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
