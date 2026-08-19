import React from 'react';
import { 
  Trophy, 
  Volume2, 
  VolumeX, 
  PlusCircle, 
  Globe, 
  Flame,
  Dices
} from 'lucide-react';
import { SportType } from '../types';

interface NavbarProps {
  activeSport: SportType | 'tournament';
  onSelectSport: (sport: SportType | 'tournament') => void;
  onOpenTeamCreator: () => void;
  onOpenNetlifyGuide: () => void;
  onRandomMatch: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeSport,
  onSelectSport,
  onOpenTeamCreator,
  onOpenNetlifyGuide,
  onRandomMatch,
  soundEnabled,
  onToggleSound,
}) => {
  const sportsNav = [
    { id: 'football', label: 'Football', icon: '⚽' },
    { id: 'basketball', label: 'Basketball', icon: '🏀' },
    { id: 'tennis', label: 'Tennis', icon: '🎾' },
    { id: 'esports', label: 'Esports', icon: '🎮' },
    { id: 'custom', label: 'Custom', icon: '⚡' },
    { id: 'tournament', label: 'Tournament Cup', icon: '🏆' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-slate-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectSport('football')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Flame className="w-6 h-6 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  MATCH QUICK
                </span>
                <span className="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  SIMULÁTOR
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium hidden sm:block">
                Instant Sports & Tactical Match Engine
              </p>
            </div>
          </div>

          {/* Sports Selector Tabs */}
          <nav className="hidden md:flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800">
            {sportsNav.map((tab) => {
              const isActive = activeSport === tab.id;
              return (
                <button
                  key={tab.id}
                  id={`nav-tab-${tab.id}`}
                  onClick={() => onSelectSport(tab.id as SportType | 'tournament')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            
            {/* Quick Random Match */}
            <button
              id="btn-random-match"
              onClick={onRandomMatch}
              title="Generate Random Clash"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-slate-700 hover:bg-slate-800 text-xs font-semibold transition-all"
            >
              <Dices className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Random Clash</span>
            </button>

            {/* Custom Team Builder */}
            <button
              id="btn-create-custom-team"
              onClick={onOpenTeamCreator}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Create Team</span>
            </button>

            {/* Netlify Deployment & Public Domain Info */}
            <button
              id="btn-netlify-guide"
              onClick={onOpenNetlifyGuide}
              title="Netlify Domain & Deploy Guide"
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-900/40 text-xs font-semibold transition-all"
            >
              <Globe className="w-4 h-4 text-cyan-400" />
              <span className="hidden lg:inline">Netlify Deploy / ZIP</span>
            </button>

            {/* Sound Toggle */}
            <button
              id="btn-toggle-sound"
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Stadium Audio' : 'Unmute Stadium Audio'}
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 transition-all"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-emerald-400" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-500" />
              )}
            </button>
          </div>

        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden overflow-x-auto py-2 gap-1.5 scrollbar-none border-t border-slate-800/60">
          {sportsNav.map((tab) => {
            const isActive = activeSport === tab.id;
            return (
              <button
                key={tab.id}
                id={`nav-mobile-${tab.id}`}
                onClick={() => onSelectSport(tab.id as SportType | 'tournament')}
                className={`flex items-center gap-1 px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};
