import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  Sliders, 
  CloudRain, 
  Sun, 
  Flame, 
  Plus, 
  Trash2, 
  Zap, 
  RotateCcw,
  Scale,
  Sparkles,
  ClipboardPaste
} from 'lucide-react';
import { 
  FootballTeamInput, 
  FootballPlayer, 
  MatchVariables, 
  Mentality, 
  Tempo, 
  Pressing, 
  Tackling, 
  Position 
} from '../types';
import { DEFAULT_PRESET_CLUBS } from '../data/footballTeams';

interface LineupBuilderProps {
  teamA: FootballTeamInput;
  teamB: FootballTeamInput;
  matchVars: MatchVariables;
  onChangeTeamA: (team: FootballTeamInput) => void;
  onChangeTeamB: (team: FootballTeamInput) => void;
  onChangeMatchVars: (vars: MatchVariables) => void;
  onSimulateMatch: () => void;
}

export const LineupBuilder: React.FC<LineupBuilderProps> = ({
  teamA,
  teamB,
  matchVars,
  onChangeTeamA,
  onChangeTeamB,
  onChangeMatchVars,
  onSimulateMatch,
}) => {
  const [activeTab, setActiveTab] = useState<'matchup' | 'tacticsA' | 'tacticsB' | 'settings'>('matchup');

  // Quick swap sides
  const handleSwapTeams = () => {
    const temp = teamA;
    onChangeTeamA(teamB);
    onChangeTeamB(temp);
  };

  // Update a single player in a team
  const handleUpdatePlayer = (teamSide: 'A' | 'B', index: number, field: keyof FootballPlayer, value: any) => {
    const targetTeam = teamSide === 'A' ? teamA : teamB;
    const updatedXI = [...targetTeam.startingXI];
    updatedXI[index] = { ...updatedXI[index], [field]: value };
    
    if (teamSide === 'A') {
      onChangeTeamA({ ...teamA, startingXI: updatedXI });
    } else {
      onChangeTeamB({ ...teamB, startingXI: updatedXI });
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Top Match Control Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl flex flex-wrap items-center justify-between gap-4">
        
        {/* Preset Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Home:</span>
            <select
              value={teamA.id}
              onChange={(e) => {
                const found = DEFAULT_PRESET_CLUBS.find(c => c.id === e.target.value);
                if (found) onChangeTeamA(JSON.parse(JSON.stringify(found)));
              }}
              className="bg-slate-950 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {DEFAULT_PRESET_CLUBS.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.badgeEmoji} {club.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleSwapTeams}
            title="Swap Home & Away"
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs flex items-center gap-1 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Swap</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Away:</span>
            <select
              value={teamB.id}
              onChange={(e) => {
                const found = DEFAULT_PRESET_CLUBS.find(c => c.id === e.target.value);
                if (found) onChangeTeamB(JSON.parse(JSON.stringify(found)));
              }}
              className="bg-slate-950 border border-slate-700 text-white font-bold text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:border-emerald-500"
            >
              {DEFAULT_PRESET_CLUBS.map((club) => (
                <option key={club.id} value={club.id}>
                  {club.badgeEmoji} {club.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Big Simulation Trigger */}
        <button
          id="btn-simulate-match-instant"
          onClick={onSimulateMatch}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm tracking-wide shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
        >
          <Zap className="w-5 h-5 fill-current text-slate-950" />
          <span>SIMULATE MATCH NOW</span>
        </button>

      </div>

      {/* Sub-tabs: Lineups vs Tactical Orders vs Match Environment */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'matchup', label: 'Starting XI Lineups', icon: Users },
          { id: 'tacticsA', label: `${teamA.name} Tactics`, icon: Sliders },
          { id: 'tacticsB', label: `${teamB.name} Tactics`, icon: Sliders },
          { id: 'settings', label: 'Match Conditions & Venue', icon: Scale },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: LINEUPS ROSTER VIEW */}
      {activeTab === 'matchup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Team A Lineup */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">{teamA.badgeEmoji}</span>
                <div>
                  <input
                    type="text"
                    value={teamA.name}
                    onChange={(e) => onChangeTeamA({ ...teamA, name: e.target.value })}
                    className="font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none text-base"
                  />
                  <div className="text-[11px] text-slate-400">11 Starting Players (Strict Roster)</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400">
                {teamA.tactics.formation}
              </span>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
              <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-slate-500 px-2 mb-1">
                <span className="col-span-1">#</span>
                <span className="col-span-2">Pos</span>
                <span className="col-span-4">Player Name</span>
                <span className="col-span-2 text-center">OVR</span>
                <span className="col-span-2 text-center">Form</span>
                <span className="col-span-1 text-center">Sta</span>
              </div>

              {teamA.startingXI.map((player, idx) => (
                <div key={player.id || idx} className="grid grid-cols-12 items-center gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <span className="col-span-1 text-slate-500 font-mono text-[11px]">
                    {player.number}
                  </span>
                  
                  <select
                    value={player.position}
                    onChange={(e) => handleUpdatePlayer('A', idx, 'position', e.target.value as Position)}
                    className="col-span-2 bg-slate-900 border border-slate-700 rounded text-[11px] font-bold text-slate-300 py-0.5 px-1"
                  >
                    <option value="GK">GK</option>
                    <option value="DF">DF</option>
                    <option value="MF">MF</option>
                    <option value="FW">FW</option>
                  </select>

                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleUpdatePlayer('A', idx, 'name', e.target.value)}
                    className="col-span-4 bg-transparent font-medium text-white focus:outline-none focus:border-b focus:border-emerald-500 truncate"
                  />

                  <input
                    type="number"
                    min="40"
                    max="99"
                    value={player.overall}
                    onChange={(e) => handleUpdatePlayer('A', idx, 'overall', Number(e.target.value))}
                    className="col-span-2 bg-slate-900 border border-slate-700 rounded text-center font-mono font-bold text-emerald-400 py-0.5"
                  />

                  <input
                    type="number"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={player.form}
                    onChange={(e) => handleUpdatePlayer('A', idx, 'form', Number(e.target.value))}
                    className="col-span-2 bg-slate-900 border border-slate-700 rounded text-center font-mono text-cyan-300 py-0.5"
                  />

                  <span className="col-span-1 text-center font-mono text-[11px] text-slate-400">
                    {player.startingStamina}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Team B Lineup */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">{teamB.badgeEmoji}</span>
                <div>
                  <input
                    type="text"
                    value={teamB.name}
                    onChange={(e) => onChangeTeamB({ ...teamB, name: e.target.value })}
                    className="font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none text-base"
                  />
                  <div className="text-[11px] text-slate-400">11 Starting Players (Strict Roster)</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-emerald-400">
                {teamB.tactics.formation}
              </span>
            </div>

            <div className="space-y-2 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
              <div className="grid grid-cols-12 text-[10px] uppercase font-bold text-slate-500 px-2 mb-1">
                <span className="col-span-1">#</span>
                <span className="col-span-2">Pos</span>
                <span className="col-span-4">Player Name</span>
                <span className="col-span-2 text-center">OVR</span>
                <span className="col-span-2 text-center">Form</span>
                <span className="col-span-1 text-center">Sta</span>
              </div>

              {teamB.startingXI.map((player, idx) => (
                <div key={player.id || idx} className="grid grid-cols-12 items-center gap-1.5 p-2 rounded-xl bg-slate-950 border border-slate-800/80 text-xs">
                  <span className="col-span-1 text-slate-500 font-mono text-[11px]">
                    {player.number}
                  </span>
                  
                  <select
                    value={player.position}
                    onChange={(e) => handleUpdatePlayer('B', idx, 'position', e.target.value as Position)}
                    className="col-span-2 bg-slate-900 border border-slate-700 rounded text-[11px] font-bold text-slate-300 py-0.5 px-1"
                  >
                    <option value="GK">GK</option>
                    <option value="DF">DF</option>
                    <option value="MF">MF</option>
                    <option value="FW">FW</option>
                  </select>

                  <input
                    type="text"
                    value={player.name}
                    onChange={(e) => handleUpdatePlayer('B', idx, 'name', e.target.value)}
                    className="col-span-4 bg-transparent font-medium text-white focus:outline-none focus:border-b focus:border-emerald-500 truncate"
                  />

                  <input
                    type="number"
                    min="40"
                    max="99"
                    value={player.overall}
                    onChange={(e) => handleUpdatePlayer('B', idx, 'overall', Number(e.target.value))}
                    className="col-span-2 bg-slate-900 border border-slate-700 rounded text-center font-mono font-bold text-emerald-400 py-0.5"
                  />

                  <input
                    type="number"
                    min="1.0"
                    max="10.0"
                    step="0.1"
                    value={player.form}
                    onChange={(e) => handleUpdatePlayer('B', idx, 'form', Number(e.target.value))}
                    className="col-span-2 bg-slate-900 border border-slate-700 rounded text-center font-mono text-cyan-300 py-0.5"
                  />

                  <span className="col-span-1 text-center font-mono text-[11px] text-slate-400">
                    {player.startingStamina}%
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: TEAM A TACTICAL SETUP (Privately processed) */}
      {activeTab === 'tacticsA' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>{teamA.badgeEmoji}</span>
              <span>{teamA.name} Tactical Instructions</span>
            </h3>
            <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              🔒 Tactically Private (Never Revealed in Output)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Formation Shape</label>
              <select
                value={teamA.tactics.formation}
                onChange={(e) => onChangeTeamA({ ...teamA, tactics: { ...teamA.tactics, formation: e.target.value } })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
              >
                <option value="4-3-3">4-3-3 (Attack Width)</option>
                <option value="4-2-3-1">4-2-3-1 (Double Pivot & CAM)</option>
                <option value="4-3-1-2">4-3-1-2 (Narrow Diamond)</option>
                <option value="3-5-2">3-5-2 (Wingbacks & Twin Strikers)</option>
                <option value="4-4-2">4-4-2 (Flat Traditional)</option>
                <option value="5-3-2">5-3-2 (Compact Low Block)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Match Mentality</label>
              <select
                value={teamA.tactics.mentality}
                onChange={(e) => onChangeTeamA({ ...teamA, tactics: { ...teamA.tactics, mentality: e.target.value as Mentality } })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Ultra Defensive">Ultra Defensive (Park the Bus)</option>
                <option value="Defensive">Defensive (Cautious Counter)</option>
                <option value="Balanced">Balanced Control</option>
                <option value="Attacking">Attacking (Forward Overload)</option>
                <option value="All-Out Attack">All-Out Attack (Gung-Ho)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Pressing Intensity</label>
              <select
                value={teamA.tactics.pressing}
                onChange={(e) => onChangeTeamA({ ...teamA, tactics: { ...teamA.tactics, pressing: e.target.value as Pressing } })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Low Block">Low Block (Conserve Energy)</option>
                <option value="Mid Block">Mid Block (Zonal Containment)</option>
                <option value="High Press & Counter-Press">High Press & Counter-Press (Gegenpress)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tackling Aggression</label>
              <select
                value={teamA.tactics.tackling}
                onChange={(e) => onChangeTeamA({ ...teamA, tactics: { ...teamA.tactics, tackling: e.target.value as Tackling } })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Cautious">Cautious (Stay on Feet)</option>
                <option value="Normal">Normal</option>
                <option value="Aggressive">Aggressive (Hard Challenges)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: TEAM B TACTICAL SETUP (Privately processed) */}
      {activeTab === 'tacticsB' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>{teamB.badgeEmoji}</span>
              <span>{teamB.name} Tactical Instructions</span>
            </h3>
            <span className="text-[11px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
              🔒 Tactically Private (Never Revealed in Output)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Formation Shape</label>
              <select
                value={teamB.tactics.formation}
                onChange={(e) => onChangeTeamB({ ...teamB, tactics: { ...teamB.tactics, formation: e.target.value } })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none font-mono"
              >
                <option value="4-3-3">4-3-3 (Attack Width)</option>
                <option value="4-2-3-1">4-2-3-1 (Double Pivot & CAM)</option>
                <option value="4-3-1-2">4-3-1-2 (Narrow Diamond)</option>
                <option value="3-5-2">3-5-2 (Wingbacks & Twin Strikers)</option>
                <option value="4-4-2">4-4-2 (Flat Traditional)</option>
                <option value="5-3-2">5-3-2 (Compact Low Block)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Match Mentality</label>
              <select
                value={teamB.tactics.mentality}
                onChange={(e) => onChangeTeamB({ ...teamB, tactics: { ...teamB.tactics, mentality: e.target.value as Mentality } })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Ultra Defensive">Ultra Defensive (Park the Bus)</option>
                <option value="Defensive">Defensive (Cautious Counter)</option>
                <option value="Balanced">Balanced Control</option>
                <option value="Attacking">Attacking (Forward Overload)</option>
                <option value="All-Out Attack">All-Out Attack (Gung-Ho)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Pressing Intensity</label>
              <select
                value={teamB.tactics.pressing}
                onChange={(e) => onChangeTeamB({ ...teamB, tactics: { ...teamB.tactics, pressing: e.target.value as Pressing } })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Low Block">Low Block (Conserve Energy)</option>
                <option value="Mid Block">Mid Block (Zonal Containment)</option>
                <option value="High Press & Counter-Press">High Press & Counter-Press (Gegenpress)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tackling Aggression</label>
              <select
                value={teamB.tactics.tackling}
                onChange={(e) => onChangeTeamB({ ...teamB, tactics: { ...teamB.tactics, tackling: e.target.value as Tackling } })}
                className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:border-emerald-500 focus:outline-none"
              >
                <option value="Cautious">Cautious (Stay on Feet)</option>
                <option value="Normal">Normal</option>
                <option value="Aggressive">Aggressive (Hard Challenges)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: VENUE & MATCH CONDITIONS */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 max-w-2xl mx-auto">
          <h3 className="font-bold text-base text-white pb-3 border-b border-slate-800 flex items-center gap-2">
            <Scale className="w-4 h-4 text-emerald-400" />
            <span>Match Environment & Referee Strictness</span>
          </h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Venue Setting</label>
              <select
                value={matchVars.venue}
                onChange={(e) => onChangeMatchVars({ ...matchVars, venue: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200"
              >
                <option value="Team A Home">{teamA.name} Home Stadium</option>
                <option value="Team B Home">{teamB.name} Home Stadium</option>
                <option value="Neutral">Neutral Ground</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Weather & Pitch State</label>
              <select
                value={matchVars.weather}
                onChange={(e) => onChangeMatchVars({ ...matchVars, weather: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200"
              >
                <option value="Clear / Mild">Clear / Mild Conditions</option>
                <option value="Heavy Rain (Slick Pitch)">Heavy Rain (Slick Pitch, Higher Injury Risk)</option>
                <option value="Extreme Heat (High Fatigue)">Extreme Heat (Severe Stamina Depletion)</option>
                <option value="Snow / Freezing">Snow / Freezing</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Referee Strictness</label>
              <select
                value={matchVars.refereeStrictness}
                onChange={(e) => onChangeMatchVars({ ...matchVars, refereeStrictness: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200"
              >
                <option value="Lenient">Lenient (Lets play flow)</option>
                <option value="Standard">Standard Regulation</option>
                <option value="Strict">Strict (High Card Frequency)</option>
              </select>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
