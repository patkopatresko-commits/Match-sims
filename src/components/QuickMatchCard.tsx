import React, { useState } from 'react';
import { 
  Play, 
  Zap, 
  Shield, 
  Swords, 
  Settings2, 
  Shuffle, 
  CloudSun, 
  CloudRain, 
  Snowflake, 
  Wind, 
  Building2,
  ChevronDown,
  Sparkles,
  Layers
} from 'lucide-react';
import { Team, TacticType, SimSettings } from '../types';

interface QuickMatchCardProps {
  teams: Team[];
  teamA: Team;
  teamB: Team;
  tacticA: TacticType;
  tacticB: TacticType;
  onChangeTeamA: (team: Team) => void;
  onChangeTeamB: (team: Team) => void;
  onChangeTacticA: (tactic: TacticType) => void;
  onChangeTacticB: (tactic: TacticType) => void;
  onSwapTeams: () => void;
  onRandomTeams: () => void;
  onStartSimulation: (isLive: boolean) => void;
  settings: SimSettings;
  onUpdateSettings: (newSettings: Partial<SimSettings>) => void;
}

const TACTICS_OPTIONS: TacticType[] = [
  'All-Out Attack',
  'High Press & Counter',
  'Tiki-Taka Possession',
  'Balanced Control',
  'Park the Bus',
  'Fast Break & Perimeter',
  'Inside Paint Domination',
  'Baseline Grinding',
  'Aggressive Rush',
  'Tactical Retake',
  'Wild Chaos'
];

export const QuickMatchCard: React.FC<QuickMatchCardProps> = ({
  teams,
  teamA,
  teamB,
  tacticA,
  tacticB,
  onChangeTeamA,
  onChangeTeamB,
  onChangeTacticA,
  onChangeTacticB,
  onSwapTeams,
  onRandomTeams,
  onStartSimulation,
  settings,
  onUpdateSettings,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [selectingSlot, setSelectingSlot] = useState<'A' | 'B' | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const filteredTeams = teams.filter(t => 
    t.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.country?.toLowerCase().includes(searchFilter.toLowerCase()) ||
    t.league?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="w-full bg-slate-900/90 rounded-2xl border border-slate-800 shadow-2xl p-4 sm:p-6 lg:p-8 relative overflow-hidden">
      
      {/* Subtle Background Glows */}
      <div 
        className="absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: teamA.primaryColor || '#10b981' }}
      />
      <div 
        className="absolute -bottom-24 -right-24 w-72 h-72 rounded-full blur-3xl opacity-20 pointer-events-none"
        style={{ background: teamB.primaryColor || '#3b82f6' }}
      />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6 relative z-10 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <h2 className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
            <span>Match Simulation Hub</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
              {teamA.sport.toUpperCase()}
            </span>
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="btn-swap-teams"
            onClick={onSwapTeams}
            title="Swap Home/Away Sides"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <Shuffle className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden sm:inline">Swap Sides</span>
          </button>

          <button
            id="btn-randomize-matchup"
            onClick={onRandomTeams}
            title="Random Matchup"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Random</span>
          </button>

          <button
            id="btn-toggle-advanced-settings"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
              showAdvanced 
                ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300' 
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Clash Area: Team A vs Team B */}
      <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center relative z-10">
        
        {/* TEAM A CARD */}
        <div className="md:col-span-5 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              HOME / SQUAD A
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              OVR: <span className="text-white text-sm">{teamA.overallRating}</span>
            </span>
          </div>

          <div className="flex items-center gap-3.5 mb-4">
            <button
              id="btn-select-team-a"
              onClick={() => setSelectingSlot('A')}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border-2 border-slate-700/50 hover:scale-105 transition-transform"
              style={{ backgroundColor: teamA.primaryColor, color: teamA.textColor || '#000000' }}
            >
              {teamA.badgeEmoji}
            </button>
            <div className="flex-1 min-w-0">
              <button
                id="btn-team-a-dropdown"
                onClick={() => setSelectingSlot('A')}
                className="text-left w-full group"
              >
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                    {teamA.name}
                  </h3>
                  <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {teamA.country || teamA.league || teamA.formation || 'Standard Squad'}
                </p>
              </button>
            </div>
          </div>

          {/* Team A Ratings Bar */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-900/80 border border-slate-800/60 mb-3 text-center">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Attack</div>
              <div className="text-sm font-bold text-emerald-400">{teamA.attackRating}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Midfield</div>
              <div className="text-sm font-bold text-cyan-400">{teamA.midfieldRating || 85}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Defense</div>
              <div className="text-sm font-bold text-indigo-400">{teamA.defenseRating}</div>
            </div>
          </div>

          {/* Team A Tactical Choice */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Tactical Strategy:</span>
              <span className="text-emerald-400 text-xs font-mono">{tacticA}</span>
            </label>
            <select
              id="select-tactic-team-a"
              value={tacticA}
              onChange={(e) => onChangeTacticA(e.target.value as TacticType)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              {TACTICS_OPTIONS.map((tac) => (
                <option key={tac} value={tac}>{tac}</option>
              ))}
            </select>
          </div>
        </div>

        {/* VS ICON / CLASH CENTER */}
        <div className="md:col-span-1 flex flex-col items-center justify-center my-2 md:my-0">
          <div className="w-12 h-12 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center shadow-lg text-emerald-400 font-black text-sm tracking-wider">
            VS
          </div>
        </div>

        {/* TEAM B CARD */}
        <div className="md:col-span-5 bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 rounded-xl p-4 sm:p-5 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              AWAY / SQUAD B
            </span>
            <span className="text-xs font-mono font-bold text-slate-400">
              OVR: <span className="text-white text-sm">{teamB.overallRating}</span>
            </span>
          </div>

          <div className="flex items-center gap-3.5 mb-4">
            <button
              id="btn-select-team-b"
              onClick={() => setSelectingSlot('B')}
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-inner border-2 border-slate-700/50 hover:scale-105 transition-transform"
              style={{ backgroundColor: teamB.primaryColor, color: teamB.textColor || '#000000' }}
            >
              {teamB.badgeEmoji}
            </button>
            <div className="flex-1 min-w-0">
              <button
                id="btn-team-b-dropdown"
                onClick={() => setSelectingSlot('B')}
                className="text-left w-full group"
              >
                <div className="flex items-center gap-1.5">
                  <h3 className="text-lg sm:text-xl font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                    {teamB.name}
                  </h3>
                  <ChevronDown className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </div>
                <p className="text-xs text-slate-400 truncate">
                  {teamB.country || teamB.league || teamB.formation || 'Standard Squad'}
                </p>
              </button>
            </div>
          </div>

          {/* Team B Ratings Bar */}
          <div className="grid grid-cols-3 gap-2 py-2 px-3 rounded-lg bg-slate-900/80 border border-slate-800/60 mb-3 text-center">
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Attack</div>
              <div className="text-sm font-bold text-emerald-400">{teamB.attackRating}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Midfield</div>
              <div className="text-sm font-bold text-cyan-400">{teamB.midfieldRating || 85}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-400 font-semibold uppercase">Defense</div>
              <div className="text-sm font-bold text-indigo-400">{teamB.defenseRating}</div>
            </div>
          </div>

          {/* Team B Tactical Choice */}
          <div className="space-y-1">
            <label className="text-[11px] font-semibold text-slate-400 flex items-center justify-between">
              <span>Tactical Strategy:</span>
              <span className="text-cyan-400 text-xs font-mono">{tacticB}</span>
            </label>
            <select
              id="select-tactic-team-b"
              value={tacticB}
              onChange={(e) => onChangeTacticB(e.target.value as TacticType)}
              className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700/80 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {TACTICS_OPTIONS.map((tac) => (
                <option key={tac} value={tac}>{tac}</option>
              ))}
            </select>
          </div>
        </div>

      </div>

      {/* Advanced Settings Drawer */}
      {showAdvanced && (
        <div className="mt-6 p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-4">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-emerald-400" />
            <span>Match Simulation Parameters & Environment</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Weather */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Weather Condition</label>
              <div className="grid grid-cols-4 gap-1">
                {[
                  { id: 'Clear', icon: <CloudSun className="w-3.5 h-3.5" /> },
                  { id: 'Rain', icon: <CloudRain className="w-3.5 h-3.5" /> },
                  { id: 'Snow', icon: <Snowflake className="w-3.5 h-3.5" /> },
                  { id: 'Windy', icon: <Wind className="w-3.5 h-3.5" /> },
                ].map((w) => (
                  <button
                    key={w.id}
                    onClick={() => onUpdateSettings({ weather: w.id as any })}
                    className={`flex items-center justify-center p-2 rounded-lg text-xs font-medium transition-all ${
                      settings.weather === w.id
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                    }`}
                    title={w.id}
                  >
                    {w.icon}
                  </button>
                ))}
              </div>
            </div>

            {/* Stadium Venue */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Venue Atmosphere</label>
              <select
                value={settings.stadiumVenue}
                onChange={(e) => onUpdateSettings({ stadiumVenue: e.target.value as any })}
                className="w-full px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200"
              >
                <option value="Home/Away">Home Advantage ({teamA.shortName})</option>
                <option value="Neutral Venue">Neutral Grand Arena</option>
                <option value="Megastadium">International Megastadium</option>
              </select>
            </div>

            {/* Extra Time & Penalties */}
            <div>
              <label className="text-xs font-medium text-slate-300 mb-1.5 block">Tie-Breaker Rules</label>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowExtraTime}
                    onChange={(e) => onUpdateSettings({ allowExtraTime: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Extra Time</span>
                </label>
                <label className="flex items-center gap-1.5 text-xs text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowPenalties}
                    onChange={(e) => onUpdateSettings({ allowPenalties: e.target.checked })}
                    className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-0"
                  />
                  <span>Penalties</span>
                </label>
              </div>
            </div>

            {/* Random Factor Slider */}
            <div>
              <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1">
                <span>RNG / Underdog Factor:</span>
                <span className="text-emerald-400 font-mono">{settings.randomFactor}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.randomFactor}
                onChange={(e) => onUpdateSettings({ randomFactor: Number(e.target.value) })}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Pure Ratings</span>
                <span>Wild Upsets</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Main Execution Actions */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 relative z-10">
        
        {/* Instant Fast Simulation */}
        <button
          id="btn-simulate-instant"
          onClick={() => onStartSimulation(false)}
          className="group flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-extrabold text-base tracking-wide shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition-all cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-current text-slate-950 group-hover:animate-bounce" />
          <span>INSTANT SIMULATE</span>
          <span className="text-xs bg-slate-950/20 text-slate-950 px-2 py-0.5 rounded-full font-bold">
            0.1s Result
          </span>
        </button>

        {/* Live Play-by-Play Visualizer */}
        <button
          id="btn-simulate-live"
          onClick={() => onStartSimulation(true)}
          className="group flex items-center justify-center gap-2.5 py-3.5 px-6 rounded-xl bg-slate-800 hover:bg-slate-700/90 border border-slate-700 hover:border-emerald-500/50 text-white font-bold text-base tracking-wide shadow-md active:scale-[0.98] transition-all cursor-pointer"
        >
          <Play className="w-5 h-5 text-emerald-400 fill-emerald-400 group-hover:scale-110 transition-transform" />
          <span>LIVE VISUALIZER</span>
          <span className="text-xs bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
            Watch Match
          </span>
        </button>

      </div>

      {/* Team Selection Modal */}
      {selectingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-white text-base">
                  Select {selectingSlot === 'A' ? 'Home / Squad A' : 'Away / Squad B'}
                </h3>
                <p className="text-xs text-slate-400">Choose from preset clubs, national teams, or custom squads</p>
              </div>
              <button
                onClick={() => setSelectingSlot(null)}
                className="text-slate-400 hover:text-white text-sm p-1.5 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Search filter input */}
            <div className="p-3 border-b border-slate-800 bg-slate-950/50">
              <input
                type="text"
                placeholder="Search teams by name, country, league..."
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                autoFocus
              />
            </div>

            {/* Teams List */}
            <div className="overflow-y-auto p-3 space-y-2 flex-1">
              {filteredTeams.map((team) => {
                const isCurrent = (selectingSlot === 'A' && teamA.id === team.id) || (selectingSlot === 'B' && teamB.id === team.id);
                return (
                  <button
                    key={team.id}
                    id={`team-option-${team.id}`}
                    onClick={() => {
                      if (selectingSlot === 'A') onChangeTeamA(team);
                      else onChangeTeamB(team);
                      setSelectingSlot(null);
                      setSearchFilter('');
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-white'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm border border-slate-700"
                        style={{ backgroundColor: team.primaryColor, color: team.textColor || '#000000' }}
                      >
                        {team.badgeEmoji}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white flex items-center gap-2">
                          <span>{team.name}</span>
                          {team.isCustom && (
                            <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-1.5 py-0.2 rounded">
                              Custom
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400">
                          {team.country || team.league || team.sport.toUpperCase()} • OVR {team.overallRating}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-right">
                      <div className="text-xs font-mono">
                        <span className="text-emerald-400 font-bold">ATT {team.attackRating}</span>
                        <span className="text-slate-600 mx-1">|</span>
                        <span className="text-indigo-400 font-bold">DEF {team.defenseRating}</span>
                      </div>
                      {isCurrent && (
                        <span className="text-emerald-400 text-xs font-bold">Selected</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
