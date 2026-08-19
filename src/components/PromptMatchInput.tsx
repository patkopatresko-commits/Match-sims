import React from 'react';
import { 
  Zap, 
  RotateCcw, 
  ShieldAlert,
  Sliders,
  Sparkles,
  Users,
  Swords
} from 'lucide-react';
import { MatchSetupInput, ValidationErrors, extractPlayerLines } from '../utils/fieldParser';

interface PromptMatchInputProps {
  setup: MatchSetupInput;
  errors: ValidationErrors;
  onSetupChange: (updater: (prev: MatchSetupInput) => MatchSetupInput) => void;
  onSimulate: () => void;
  onLoadPreset: (presetName: string) => void;
  onReset: () => void;
}

export const PromptMatchInput: React.FC<PromptMatchInputProps> = ({
  setup,
  errors,
  onSetupChange,
  onSimulate,
  onLoadPreset,
  onReset,
}) => {
  const linesA = extractPlayerLines(setup.teamA.playersText);
  const linesB = extractPlayerLines(setup.teamB.playersText);

  const isCountAExact = linesA.length === 11;
  const isCountBExact = linesB.length === 11;

  const handleTeamAChange = (field: 'name' | 'playersText' | 'tacticalInstructions', val: string) => {
    onSetupChange(prev => ({
      ...prev,
      teamA: {
        ...prev.teamA,
        [field]: val,
      }
    }));
  };

  const handleTeamBChange = (field: 'name' | 'playersText' | 'tacticalInstructions', val: string) => {
    onSetupChange(prev => ({
      ...prev,
      teamB: {
        ...prev.teamB,
        [field]: val,
      }
    }));
  };

  const handleMatchVarChange = (field: keyof typeof setup.matchVars, val: any) => {
    onSetupChange(prev => ({
      ...prev,
      matchVars: {
        ...prev.matchVars,
        [field]: val,
      }
    }));
  };

  const hasAnyErrors = Object.keys(errors).length > 0;

  return (
    <div className="w-full space-y-6">
      
      {/* Top Controls & Presets */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Quick Presets:
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onLoadPreset('mci_rma')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Man City vs Real Madrid
            </button>
            <button
              onClick={() => onLoadPreset('ars_liv')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Arsenal vs Liverpool
            </button>
            <button
              onClick={() => onLoadPreset('bar_bay')}
              className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
            >
              Barcelona vs Bayern
            </button>
          </div>
        </div>

        <button
          onClick={onReset}
          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 border border-slate-700 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Clear All Fields</span>
        </button>
      </div>

      {/* Global Validation Error Banner */}
      {hasAnyErrors && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-1.5 shadow-lg">
          <div className="flex items-center gap-2 font-bold text-rose-200 text-sm">
            <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
            <span>Please resolve validation requirements before simulating:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-rose-300 pl-1 font-mono">
            {errors.teamAName && <li>{errors.teamAName}</li>}
            {errors.teamAPlayers && <li>{errors.teamAPlayers}</li>}
            {errors.teamBName && <li>{errors.teamBName}</li>}
            {errors.teamBPlayers && <li>{errors.teamBPlayers}</li>}
            {errors.general && <li>{errors.general}</li>}
          </ul>
        </div>
      )}

      {/* Team Setup Grid: Team A vs Team B */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ================= TEAM A (HOME) ================= */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                  <span>Team 1 (Home)</span>
                  <span className="text-[11px] font-normal text-emerald-400 font-mono">🔵 Blue</span>
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Strict Field Separation</span>
            </div>

            {/* Field 1: Team Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="team-a-name-input" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  1. Team Name <span className="text-rose-400">*</span>
                </label>
                {errors.teamAName && (
                  <span className="text-[11px] text-rose-400 font-medium">Required</span>
                )}
              </div>
              <input
                id="team-a-name-input"
                type="text"
                value={setup.teamA.name}
                onChange={(e) => handleTeamAChange('name', e.target.value)}
                placeholder="e.g. Manchester City"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 text-slate-100 font-semibold text-sm border focus:outline-none transition-all ${
                  errors.teamAName
                    ? 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500'
                }`}
              />
              {errors.teamAName && (
                <p className="text-[11px] text-rose-400 font-medium">{errors.teamAName}</p>
              )}
            </div>

            {/* Field 2: Players (11 lines only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="team-a-players-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-emerald-400" />
                  <span>2. Players (11 lines only) <span className="text-rose-400">*</span></span>
                </label>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                  isCountAExact 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {linesA.length} / 11 Players
                </span>
              </div>
              
              <p className="text-[11px] text-slate-400">
                Enter 1 player per line (11 lines total). Blank lines are ignored and never counted.
              </p>

              <textarea
                id="team-a-players-input"
                rows={11}
                value={setup.teamA.playersText}
                onChange={(e) => handleTeamAChange('playersText', e.target.value)}
                placeholder={`1. Ederson (GK) 88 OVR 7.2 form
2. Kyle Walker (DF) 84 OVR 6.9 form
3. Rúben Dias (DF) 89 OVR 7.8 form
4. Manuel Akanji (DF) 85 OVR 7.3 form
5. Josko Gvardiol (DF) 86 OVR 7.5 form
6. Rodri (MF) 91 OVR 8.4 form
7. Kevin De Bruyne (MF) 91 OVR 8.2 form
8. Bernardo Silva (MF) 88 OVR 7.9 form
9. Phil Foden (FW) 89 OVR 8.1 form
10. Erling Haaland (FW) 91 OVR 8.6 form
11. Jérémy Doku (FW) 83 OVR 7.4 form`}
                className={`w-full p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed border focus:outline-none transition-all resize-y ${
                  errors.teamAPlayers
                    ? 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-500'
                    : (isCountAExact ? 'border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500' : 'border-amber-500/50 focus:border-amber-400')
                }`}
              />
              
              {errors.teamAPlayers ? (
                <p className="text-[11px] text-rose-400 font-medium">{errors.teamAPlayers}</p>
              ) : (
                !isCountAExact && (
                  <p className="text-[11px] text-amber-400 font-medium">
                    {linesA.length < 11 ? `Add ${11 - linesA.length} more player line(s)` : `Remove ${linesA.length - 11} extra line(s)`}
                  </p>
                )
              )}
            </div>

            {/* Field 3: Tactical Instructions */}
            <div className="space-y-1.5">
              <label htmlFor="team-a-tactics-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-emerald-400" />
                <span>3. Tactical Instructions</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Formation, mentality, pressing, tackling, and tempo. Stored separately and never mixed with players or team name.
              </p>
              <textarea
                id="team-a-tactics-input"
                rows={3}
                value={setup.teamA.tacticalInstructions}
                onChange={(e) => handleTeamAChange('tacticalInstructions', e.target.value)}
                placeholder="Formation: 4-3-3. High press, attacking mentality, direct high tempo, normal tackling"
                className="w-full p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 resize-y"
              />
            </div>
          </div>

        </div>

        {/* ================= TEAM B (AWAY) ================= */}
        <div className="bg-slate-900 border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-xl space-y-5 flex flex-col justify-between">
          
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="font-extrabold text-base text-white tracking-tight flex items-center gap-2">
                  <span>Team 2 (Away)</span>
                  <span className="text-[11px] font-normal text-cyan-400 font-mono">🔴 Red</span>
                </h2>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Strict Field Separation</span>
            </div>

            {/* Field 1: Team Name */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="team-b-name-input" className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  1. Team Name <span className="text-rose-400">*</span>
                </label>
                {errors.teamBName && (
                  <span className="text-[11px] text-rose-400 font-medium">Required</span>
                )}
              </div>
              <input
                id="team-b-name-input"
                type="text"
                value={setup.teamB.name}
                onChange={(e) => handleTeamBChange('name', e.target.value)}
                placeholder="e.g. Real Madrid"
                className={`w-full px-3.5 py-2.5 rounded-xl bg-slate-950 text-slate-100 font-semibold text-sm border focus:outline-none transition-all ${
                  errors.teamBName
                    ? 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500'
                }`}
              />
              {errors.teamBName && (
                <p className="text-[11px] text-rose-400 font-medium">{errors.teamBName}</p>
              )}
            </div>

            {/* Field 2: Players (11 lines only) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="team-b-players-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-cyan-400" />
                  <span>2. Players (11 lines only) <span className="text-rose-400">*</span></span>
                </label>
                <span className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold ${
                  isCountBExact 
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                }`}>
                  {linesB.length} / 11 Players
                </span>
              </div>
              
              <p className="text-[11px] text-slate-400">
                Enter 1 player per line (11 lines total). Blank lines are ignored and never counted.
              </p>

              <textarea
                id="team-b-players-input"
                rows={11}
                value={setup.teamB.playersText}
                onChange={(e) => handleTeamBChange('playersText', e.target.value)}
                placeholder={`1. Thibaut Courtois (GK) 90 OVR 8.0 form
2. Dani Carvajal (DF) 86 OVR 7.7 form
3. Éder Militão (DF) 86 OVR 7.4 form
4. Antonio Rüdiger (DF) 88 OVR 8.1 form
5. Ferland Mendy (DF) 83 OVR 7.2 form
6. Aurélien Tchouaméni (MF) 86 OVR 7.5 form
7. Federico Valverde (MF) 89 OVR 8.3 form
8. Eduardo Camavinga (MF) 85 OVR 7.6 form
9. Jude Bellingham (MF) 90 OVR 8.5 form
10. Kylian Mbappé (FW) 91 OVR 8.7 form
11. Vinícius Júnior (FW) 90 OVR 8.6 form`}
                className={`w-full p-3.5 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed border focus:outline-none transition-all resize-y ${
                  errors.teamBPlayers
                    ? 'border-rose-500/80 focus:border-rose-400 focus:ring-1 focus:ring-rose-500'
                    : (isCountBExact ? 'border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500' : 'border-amber-500/50 focus:border-amber-400')
                }`}
              />
              
              {errors.teamBPlayers ? (
                <p className="text-[11px] text-rose-400 font-medium">{errors.teamBPlayers}</p>
              ) : (
                !isCountBExact && (
                  <p className="text-[11px] text-amber-400 font-medium">
                    {linesB.length < 11 ? `Add ${11 - linesB.length} more player line(s)` : `Remove ${linesB.length - 11} extra line(s)`}
                  </p>
                )
              )}
            </div>

            {/* Field 3: Tactical Instructions */}
            <div className="space-y-1.5">
              <label htmlFor="team-b-tactics-input" className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <Swords className="w-3.5 h-3.5 text-cyan-400" />
                <span>3. Tactical Instructions</span>
              </label>
              <p className="text-[11px] text-slate-400">
                Formation, mentality, pressing, tackling, and tempo. Stored separately and never mixed with players or team name.
              </p>
              <textarea
                id="team-b-tactics-input"
                rows={3}
                value={setup.teamB.tacticalInstructions}
                onChange={(e) => handleTeamBChange('tacticalInstructions', e.target.value)}
                placeholder="Formation: 4-3-1-2. Attacking mentality, high tempo, mid block, normal tackling"
                className="w-full p-3 rounded-xl bg-slate-950 text-slate-100 font-mono text-xs border border-slate-800 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 resize-y"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Match Conditions Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-3">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-300">
            Match Conditions
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block text-slate-400 font-semibold mb-1">Venue</label>
            <select
              value={setup.matchVars.venue}
              onChange={(e) => handleMatchVarChange('venue', e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium focus:border-emerald-500 focus:outline-none"
            >
              <option value="Neutral">Neutral Ground</option>
              <option value="Team A Home">Team 1 Home Advantage</option>
              <option value="Team B Home">Team 2 Home Advantage</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Weather</label>
            <select
              value={setup.matchVars.weather}
              onChange={(e) => handleMatchVarChange('weather', e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium focus:border-emerald-500 focus:outline-none"
            >
              <option value="Clear / Mild">Clear / Mild</option>
              <option value="Heavy Rain (Slick Pitch)">Heavy Rain (Slick Pitch)</option>
              <option value="Extreme Heat (High Fatigue)">Extreme Heat (High Fatigue)</option>
              <option value="Snow / Freezing">Snow / Freezing</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Referee Strictness</label>
            <select
              value={setup.matchVars.refereeStrictness}
              onChange={(e) => handleMatchVarChange('refereeStrictness', e.target.value)}
              className="w-full p-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-medium focus:border-emerald-500 focus:outline-none"
            >
              <option value="Lenient">Lenient</option>
              <option value="Standard">Standard</option>
              <option value="Strict">Strict</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Extra Time (120 min)</label>
            <button
              type="button"
              onClick={() => handleMatchVarChange('extraTime', !setup.matchVars.extraTime)}
              className={`w-full p-2 rounded-lg border font-bold text-xs transition-colors flex items-center justify-center gap-2 ${
                setup.matchVars.extraTime 
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span>{setup.matchVars.extraTime ? '✓ Extra Time Enabled' : '90 Min Regular Only'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Simulate CTA */}
      <button
        id="btn-simulate-match"
        onClick={onSimulate}
        className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm tracking-wider shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
      >
        <Zap className="w-5 h-5 fill-current text-slate-950" />
        <span>SIMULATE MATCH</span>
      </button>

    </div>
  );
};
