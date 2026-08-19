import React, { useState } from 'react';
import { 
  PlusCircle, 
  Save, 
  Trash2, 
  Sparkles, 
  Shield, 
  Swords, 
  Users, 
  Check 
} from 'lucide-react';
import { Team, Player, SportType, TacticType } from '../types';

interface TeamCreatorModalProps {
  onSaveTeam: (team: Team) => void;
  onClose: () => void;
}

const EMOJI_OPTIONS = ['🦁', '🦅', '🐺', '⚡', '🔥', '👑', '🐉', '⚔️', '🛡️', '🪐', '🚀', '⭐', '🐯', '🦈', '🐍', '💎'];

export const TeamCreatorModal: React.FC<TeamCreatorModalProps> = ({
  onSaveTeam,
  onClose,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [sport, setSport] = useState<SportType>('football');
  const [primaryColor, setPrimaryColor] = useState('#10b981');
  const [secondaryColor, setSecondaryColor] = useState('#0f172a');
  const [badgeEmoji, setBadgeEmoji] = useState('🔥');
  const [attackRating, setAttackRating] = useState(88);
  const [defenseRating, setDefenseRating] = useState(86);
  const [midfieldRating, setMidfieldRating] = useState(87);
  const [defaultTactic, setDefaultTactic] = useState<TacticType>('All-Out Attack');
  const [formation, setFormation] = useState('4-3-3');
  const [players, setPlayers] = useState<Player[]>([
    { id: 'cp-1', name: 'Ace Striker', number: 9, position: 'FW', rating: 90 },
    { id: 'cp-2', name: 'Playmaker Maestro', number: 10, position: 'MF', rating: 88 },
    { id: 'cp-3', name: 'Iron Defender', number: 4, position: 'DF', rating: 87 },
    { id: 'cp-4', name: 'Wall Keeper', number: 1, position: 'GK', rating: 86 },
  ]);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerPos, setNewPlayerPos] = useState('FW');
  const [newPlayerRating, setNewPlayerRating] = useState(85);

  const handleAddPlayer = () => {
    if (!newPlayerName.trim()) return;
    const newPlayer: Player = {
      id: `cp-${Date.now()}`,
      name: newPlayerName.trim(),
      number: players.length + 1,
      position: newPlayerPos,
      rating: newPlayerRating
    };
    setPlayers([...players, newPlayer]);
    setNewPlayerName('');
  };

  const handleRemovePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const overall = Math.round((attackRating + defenseRating + midfieldRating) / 3);
    const customTeam: Team = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      shortName: (shortName || name.slice(0, 3)).toUpperCase(),
      sport,
      primaryColor,
      secondaryColor,
      textColor: '#ffffff',
      badgeEmoji,
      overallRating: overall,
      attackRating,
      defenseRating,
      midfieldRating,
      goalkeeperRating: defenseRating,
      form: 9,
      aggression: 'Aggressive',
      defaultTactic,
      formation,
      players: players.length > 0 ? players : [
        { id: 'cp-def', name: `${name} Captain`, number: 10, position: 'FW', rating: overall }
      ],
      isCustom: true
    };

    onSaveTeam(customTeam);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">Create Custom Team</h3>
              <p className="text-xs text-slate-400">Design your own club or franchise with custom tactics & roster</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-6 flex-1 scrollbar-thin">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Team / Club Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Neo Tokyo Vipers"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Short Tag (3-4 Letters)</label>
              <input
                type="text"
                maxLength={4}
                placeholder="e.g. NTV"
                value={shortName}
                onChange={(e) => setShortName(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 font-mono uppercase focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Sport & Badge Emoji */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Sport Category</label>
              <select
                value={sport}
                onChange={(e) => setSport(e.target.value as SportType)}
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="football">⚽ Football / Soccer</option>
                <option value="basketball">🏀 Basketball</option>
                <option value="tennis">🎾 Tennis</option>
                <option value="esports">🎮 Esports</option>
                <option value="custom">⚡ Custom Super Battle</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Badge Emblem</label>
              <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-slate-950 border border-slate-700">
                {EMOJI_OPTIONS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => setBadgeEmoji(emoji)}
                    className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                      badgeEmoji === emoji ? 'bg-emerald-500 text-slate-950 scale-110 font-bold' : 'hover:bg-slate-800'
                    }`}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Colors & Style */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Primary Color</label>
              <input
                type="color"
                value={primaryColor}
                onChange={(e) => setPrimaryColor(e.target.value)}
                className="w-full h-10 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer p-1"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 mb-1 block">Secondary Color</label>
              <input
                type="color"
                value={secondaryColor}
                onChange={(e) => setSecondaryColor(e.target.value)}
                className="w-full h-10 rounded-xl bg-slate-950 border border-slate-700 cursor-pointer p-1"
              />
            </div>

            {/* Live Badge Preview */}
            <div className="col-span-2 sm:col-span-1 flex items-center justify-center">
              <div 
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-xl border-2 border-white/20"
                style={{ backgroundColor: primaryColor }}
              >
                {badgeEmoji}
              </div>
            </div>
          </div>

          {/* Ratings Sliders */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>Attribute Ratings</span>
            </h4>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Attack Rating</span>
                <span className="text-emerald-400 font-mono font-bold">{attackRating}</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={attackRating}
                onChange={(e) => setAttackRating(Number(e.target.value))}
                className="w-full accent-emerald-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Midfield / Pace Rating</span>
                <span className="text-cyan-400 font-mono font-bold">{midfieldRating}</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={midfieldRating}
                onChange={(e) => setMidfieldRating(Number(e.target.value))}
                className="w-full accent-cyan-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-medium text-slate-300 mb-1">
                <span>Defense Rating</span>
                <span className="text-indigo-400 font-mono font-bold">{defenseRating}</span>
              </div>
              <input
                type="range"
                min="50"
                max="99"
                value={defenseRating}
                onChange={(e) => setDefenseRating(Number(e.target.value))}
                className="w-full accent-indigo-500"
              />
            </div>
          </div>

          {/* Tactical Style */}
          <div>
            <label className="text-xs font-semibold text-slate-300 mb-1 block">Default Tactical Philosophy</label>
            <select
              value={defaultTactic}
              onChange={(e) => setDefaultTactic(e.target.value as TacticType)}
              className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
            >
              <option value="All-Out Attack">All-Out Attack</option>
              <option value="High Press & Counter">High Press & Counter</option>
              <option value="Tiki-Taka Possession">Tiki-Taka Possession</option>
              <option value="Balanced Control">Balanced Control</option>
              <option value="Park the Bus">Park the Bus</option>
              <option value="Fast Break & Perimeter">Fast Break & Perimeter</option>
              <option value="Inside Paint Domination">Inside Paint Domination</option>
              <option value="Wild Chaos">Wild Chaos</option>
            </select>
          </div>

          {/* Roster Management */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Users className="w-4 h-4 text-purple-400" />
                <span>Squad Roster ({players.length} Players)</span>
              </label>
            </div>

            {/* Existing Players List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
              {players.map((p) => (
                <div key={p.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 text-xs">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-slate-500 font-mono">#{p.number}</span>
                    <span className="font-semibold text-white truncate">{p.name}</span>
                    <span className="text-[10px] bg-slate-800 text-slate-400 px-1 rounded">{p.position}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-emerald-400">{p.rating}</span>
                    <button
                      type="button"
                      onClick={() => handleRemovePlayer(p.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Player Input Row */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-2 p-2 rounded-xl bg-slate-950 border border-slate-800">
              <input
                type="text"
                placeholder="Player name..."
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                className="flex-1 min-w-[120px] px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500"
              />
              <select
                value={newPlayerPos}
                onChange={(e) => setNewPlayerPos(e.target.value)}
                className="px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white"
              >
                <option value="FW">FW</option>
                <option value="MF">MF</option>
                <option value="DF">DF</option>
                <option value="GK">GK</option>
                <option value="PG">PG</option>
                <option value="SG">SG</option>
                <option value="C">C</option>
                <option value="Ace">Ace</option>
              </select>
              <input
                type="number"
                min="50"
                max="99"
                value={newPlayerRating}
                onChange={(e) => setNewPlayerRating(Number(e.target.value))}
                className="w-16 px-2 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-white font-mono text-center"
              />
              <button
                type="button"
                onClick={handleAddPlayer}
                className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all"
              >
                Add
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              id="btn-save-custom-team-submit"
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-black text-xs shadow-lg shadow-emerald-500/20"
            >
              <Save className="w-4 h-4" />
              <span>Save & Use Team</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
