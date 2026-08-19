import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { QuickMatchCard } from './components/QuickMatchCard';
import { LiveMatchVisualizer } from './components/LiveMatchVisualizer';
import { MatchSummaryModal } from './components/MatchSummaryModal';
import { TournamentBracket } from './components/TournamentBracket';
import { TeamCreatorModal } from './components/TeamCreatorModal';
import { NetlifyGuideModal } from './components/NetlifyGuideModal';

import { PRESET_TEAMS } from './data/presets';
import { Team, SportType, TacticType, MatchResult, SimSettings } from './types';
import { simulateUniversalMatch } from './utils/simulationEngine';
import { soundFx } from './utils/audio';

import { 
  Trophy, 
  History, 
  Sparkles, 
  RotateCcw, 
  Flame, 
  Layers, 
  ChevronRight,
  Shield,
  Zap,
  Globe,
  Dices
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'match_quick_custom_teams_v1';
const HISTORY_STORAGE_KEY = 'match_quick_history_v1';

export default function App() {
  const [activeSport, setActiveSport] = useState<SportType | 'tournament'>('football');
  const [teams, setTeams] = useState<Team[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return [...PRESET_TEAMS, ...parsed];
      }
    } catch {
      // Fallback
    }
    return PRESET_TEAMS;
  });

  const [teamA, setTeamA] = useState<Team>(PRESET_TEAMS[0]);
  const [teamB, setTeamB] = useState<Team>(PRESET_TEAMS[1]);
  const [tacticA, setTacticA] = useState<TacticType>(PRESET_TEAMS[0].defaultTactic);
  const [tacticB, setTacticB] = useState<TacticType>(PRESET_TEAMS[1].defaultTactic);

  const [settings, setSettings] = useState<SimSettings>({
    speed: 'instant',
    weather: 'Clear',
    stadiumVenue: 'Home/Away',
    allowExtraTime: true,
    allowPenalties: true,
    randomFactor: 25,
    soundEffects: true,
  });

  // Active match visualizer / summary states
  const [activeLiveMatch, setActiveLiveMatch] = useState<MatchResult | null>(null);
  const [matchSummary, setMatchSummary] = useState<MatchResult | null>(null);
  const [matchHistory, setMatchHistory] = useState<MatchResult[]>(() => {
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return [];
  });

  // Modals
  const [isTeamCreatorOpen, setIsTeamCreatorOpen] = useState(false);
  const [isNetlifyGuideOpen, setIsNetlifyGuideOpen] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Sync audio toggle with soundFx
  useEffect(() => {
    soundFx.enabled = soundEnabled;
  }, [soundEnabled]);

  // Update teams on sport switch
  const handleSelectSport = (sport: SportType | 'tournament') => {
    setActiveSport(sport);
    if (sport !== 'tournament') {
      const sportTeams = teams.filter(t => t.sport === sport || (sport === 'custom' && t.isCustom));
      const pool = sportTeams.length >= 2 ? sportTeams : teams;
      setTeamA(pool[0]);
      setTeamB(pool[1] || pool[0]);
      setTacticA(pool[0].defaultTactic);
      setTacticB((pool[1] || pool[0]).defaultTactic);
    }
  };

  // Swap Home and Away sides
  const handleSwapTeams = () => {
    const tempTeam = teamA;
    const tempTactic = tacticA;
    setTeamA(teamB);
    setTacticA(tacticB);
    setTeamB(tempTeam);
    setTacticB(tempTactic);
  };

  // Pick 2 random teams for current sport
  const handleRandomMatch = () => {
    const currentSport = activeSport === 'tournament' ? 'football' : activeSport;
    const sportTeams = teams.filter(t => t.sport === currentSport || t.isCustom);
    const pool = sportTeams.length >= 2 ? sportTeams : teams;
    
    const shuffled = [...pool].sort(() => 0.5 - Math.random());
    const first = shuffled[0];
    const second = shuffled[1] || shuffled[0];

    setTeamA(first);
    setTeamB(second);
    setTacticA(first.defaultTactic);
    setTacticB(second.defaultTactic);
    soundFx.playHit();
  };

  // Start Simulation (Instant vs Live Visualizer)
  const handleStartSimulation = (isLive: boolean) => {
    const result = simulateUniversalMatch(teamA, teamB, tacticA, tacticB, settings);
    
    // Save to history
    const updatedHistory = [result, ...matchHistory.slice(0, 19)];
    setMatchHistory(updatedHistory);
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updatedHistory));
    } catch {
      // Ignore storage error
    }

    if (isLive) {
      soundFx.playWhistle();
      setActiveLiveMatch(result);
    } else {
      soundFx.playWhistle();
      setMatchSummary(result);
    }
  };

  // Handle saving new custom team
  const handleSaveCustomTeam = (newTeam: Team) => {
    const updated = [...teams, newTeam];
    setTeams(updated);
    
    const customOnly = updated.filter(t => t.isCustom);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(customOnly));
    } catch {
      // Ignore storage error
    }

    // Set as active Team A
    setTeamA(newTeam);
    setTacticA(newTeam.defaultTactic);
    setActiveSport(newTeam.sport);
  };

  // Handle rematch
  const handleRematch = (inverse: boolean) => {
    if (!matchSummary) return;
    setMatchSummary(null);
    if (inverse) {
      handleSwapTeams();
      setTimeout(() => handleStartSimulation(false), 200);
    } else {
      setTimeout(() => handleStartSimulation(false), 200);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-emerald-500 selection:text-slate-950 font-sans">
      
      {/* Top Navigation */}
      <Navbar
        activeSport={activeSport}
        onSelectSport={handleSelectSport}
        onOpenTeamCreator={() => setIsTeamCreatorOpen(true)}
        onOpenNetlifyGuide={() => setIsNetlifyGuideOpen(true)}
        onRandomMatch={handleRandomMatch}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
        
        {/* Dynamic Sport Hero Tagline */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 inline-flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>Next-Gen Match Simulator</span>
              </span>
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                Real-Time Tactical Clash
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              {activeSport === 'tournament' ? (
                <span>World Championship <span className="text-emerald-400">Cup Bracket</span></span>
              ) : (
                <span>Instant <span className="capitalize text-emerald-400">{activeSport}</span> Simulator</span>
              )}
            </h1>
          </div>

          {/* Quick Stats Pill */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl p-2 px-3 text-xs text-slate-300">
            <Shield className="w-4 h-4 text-emerald-400" />
            <span><strong className="text-white font-mono">{teams.length}</strong> Teams Loaded</span>
            <span className="text-slate-600">|</span>
            <span><strong className="text-white font-mono">{matchHistory.length}</strong> Matches Simulated</span>
          </div>
        </div>

        {/* VIEW 1: LIVE MATCH VISUALIZER (If active) */}
        {activeLiveMatch ? (
          <LiveMatchVisualizer
            matchResult={activeLiveMatch}
            onFinish={(result) => {
              setActiveLiveMatch(null);
              setMatchSummary(result);
            }}
            onCancel={() => setActiveLiveMatch(null)}
          />
        ) : activeSport === 'tournament' ? (
          /* VIEW 2: TOURNAMENT BRACKET CUP */
          <TournamentBracket
            teams={teams}
            sport="football"
            onOpenMatchReport={(result) => setMatchSummary(result)}
          />
        ) : (
          /* VIEW 3: MATCHMAKER HUB */
          <div className="space-y-8">
            <QuickMatchCard
              teams={teams.filter(t => t.sport === activeSport || t.isCustom || activeSport === 'custom')}
              teamA={teamA}
              teamB={teamB}
              tacticA={tacticA}
              tacticB={tacticB}
              onChangeTeamA={(team) => {
                setTeamA(team);
                setTacticA(team.defaultTactic);
              }}
              onChangeTeamB={(team) => {
                setTeamB(team);
                setTacticB(team.defaultTactic);
              }}
              onChangeTacticA={setTacticA}
              onChangeTacticB={setTacticB}
              onSwapTeams={handleSwapTeams}
              onRandomTeams={handleRandomMatch}
              onStartSimulation={handleStartSimulation}
              settings={settings}
              onUpdateSettings={(newVals) => setSettings({ ...settings, ...newVals })}
            />

            {/* Quick Preset Showdown Cards */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400" />
                  <span>Featured Marquee Showdowns</span>
                </h3>
                <span className="text-xs text-slate-500 hidden sm:inline">
                  Click any clash to load instantly
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { nameA: 'Real Madrid CF', nameB: 'Manchester City', label: 'European Heavyweights', sport: 'football' },
                  { nameA: 'FC Barcelona', nameB: 'Bayern München', label: 'Continental Showdown', sport: 'football' },
                  { nameA: 'Boston Celtics', nameB: 'Golden State Warriors', label: 'Coast to Coast Battle', sport: 'basketball' },
                  { nameA: 'Carlos Alcaraz', nameB: 'Jannik Sinner', label: 'Next-Gen Final', sport: 'tennis' },
                ].map((showdown, idx) => {
                  const tA = teams.find(t => t.name.includes(showdown.nameA.split(' ')[0])) || teams[0];
                  const tB = teams.find(t => t.name.includes(showdown.nameB.split(' ')[0])) || teams[1];

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setActiveSport(showdown.sport as SportType);
                        setTeamA(tA);
                        setTeamB(tB);
                        setTacticA(tA.defaultTactic);
                        setTacticB(tB.defaultTactic);
                        soundFx.playHit();
                      }}
                      className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group flex flex-col justify-between"
                    >
                      <div className="text-[10px] uppercase font-bold text-emerald-400 mb-2">
                        {showdown.label}
                      </div>
                      <div className="flex items-center justify-between text-xs font-bold text-white mb-1">
                        <span className="truncate">{tA.shortName}</span>
                        <span className="text-slate-600 px-1 font-mono text-[10px]">VS</span>
                        <span className="truncate">{tB.shortName}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 flex items-center justify-between pt-1 border-t border-slate-800/80">
                        <span>{tA.badgeEmoji} vs {tB.badgeEmoji}</span>
                        <span className="text-emerald-400 font-mono text-[10px] group-hover:underline">Load &rarr;</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Match History & Logs */}
            {matchHistory.length > 0 && (
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">Recent Simulation Feed</h3>
                  </div>
                  <button
                    onClick={() => {
                      setMatchHistory([]);
                      localStorage.removeItem(HISTORY_STORAGE_KEY);
                    }}
                    className="text-xs text-slate-500 hover:text-red-400 transition-colors"
                  >
                    Clear History
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {matchHistory.slice(0, 6).map((hist) => (
                    <div
                      key={hist.id}
                      onClick={() => setMatchSummary(hist)}
                      className="p-3 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between text-xs group"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-base">{hist.teamA.badgeEmoji}</span>
                        <span className="font-bold text-slate-200 truncate">{hist.teamA.shortName}</span>
                      </div>

                      <div className="px-2.5 py-1 rounded-lg bg-slate-900 font-mono font-bold text-white group-hover:text-emerald-400 transition-colors border border-slate-800">
                        {hist.scoreA} : {hist.scoreB}
                      </div>

                      <div className="flex items-center gap-2 truncate text-right">
                        <span className="font-bold text-slate-200 truncate">{hist.teamB.shortName}</span>
                        <span className="text-base">{hist.teamB.badgeEmoji}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-300">Match Quick Simulátor</span>
            <span>•</span>
            <span>Public Match & Cup Engine</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsNetlifyGuideOpen(true)}
              className="text-cyan-400 hover:underline flex items-center gap-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>Netlify Domain & Host Guide</span>
            </button>
            <button
              onClick={() => setIsTeamCreatorOpen(true)}
              className="text-emerald-400 hover:underline"
            >
              Custom Team Creator
            </button>
          </div>
        </div>
      </footer>

      {/* POST-MATCH SUMMARY REPORT MODAL */}
      {matchSummary && (
        <MatchSummaryModal
          result={matchSummary}
          onClose={() => setMatchSummary(null)}
          onRematch={handleRematch}
        />
      )}

      {/* CUSTOM TEAM CREATOR MODAL */}
      {isTeamCreatorOpen && (
        <TeamCreatorModal
          onSaveTeam={handleSaveCustomTeam}
          onClose={() => setIsTeamCreatorOpen(false)}
        />
      )}

      {/* NETLIFY DEPLOYMENT & DOMAIN GUIDE MODAL */}
      {isNetlifyGuideOpen && (
        <NetlifyGuideModal
          onClose={() => setIsNetlifyGuideOpen(false)}
        />
      )}

    </div>
  );
}
