import React, { useState } from 'react';
import { 
  Trophy, 
  Play, 
  Zap, 
  Sparkles, 
  RotateCcw, 
  Crown, 
  Award, 
  Users, 
  Flame,
  ChevronRight
} from 'lucide-react';
import { Team, Tournament, TournamentMatch, SportType } from '../types';
import { simulateUniversalMatch } from '../utils/simulationEngine';
import { soundFx } from '../utils/audio';
import confetti from 'canvas-confetti';

interface TournamentBracketProps {
  teams: Team[];
  sport: SportType;
  onOpenMatchReport: (result: any) => void;
}

export const TournamentBracket: React.FC<TournamentBracketProps> = ({
  teams,
  sport,
  onOpenMatchReport,
}) => {
  const [tournamentSize, setTournamentSize] = useState<4 | 8 | 16>(8);
  const [tournament, setTournament] = useState<Tournament | null>(null);

  // Initialize Tournament
  const initTournament = (size: 4 | 8 | 16) => {
    const sportTeams = teams.filter(t => t.sport === sport || t.isCustom);
    const pool = sportTeams.length >= size ? sportTeams : teams;
    
    // Shuffle and pick top N teams
    const shuffled = [...pool].sort(() => 0.5 - Math.random()).slice(0, size);
    
    // Create rounds structure
    const rounds: Tournament['rounds'] = [];
    let numMatches = size / 2;
    let roundIndex = 0;

    const roundNamesMap: Record<number, string[]> = {
      4: ['Semifinals', 'Grand Final'],
      8: ['Quarterfinals', 'Semifinals', 'Grand Final'],
      16: ['Round of 16', 'Quarterfinals', 'Semifinals', 'Grand Final']
    };

    const roundNames = roundNamesMap[size] || ['Round 1', 'Final'];

    roundNames.forEach((name, rIdx) => {
      const matches: TournamentMatch[] = [];
      for (let m = 0; m < numMatches; m++) {
        if (rIdx === 0) {
          matches.push({
            id: `match-r${rIdx}-m${m}`,
            roundIndex: rIdx,
            matchIndex: m,
            teamA: shuffled[m * 2],
            teamB: shuffled[m * 2 + 1],
          });
        } else {
          matches.push({
            id: `match-r${rIdx}-m${m}`,
            roundIndex: rIdx,
            matchIndex: m,
          });
        }
      }
      rounds.push({ roundName: name, matches });
      numMatches = numMatches / 2;
    });

    setTournament({
      id: `tourney-${Date.now()}`,
      name: `${sport.toUpperCase()} World Championship Cup`,
      sport,
      size,
      teams: shuffled,
      rounds,
      currentRoundIndex: 0,
      isFinished: false,
      createdAt: Date.now()
    });
  };

  React.useEffect(() => {
    initTournament(tournamentSize);
  }, [tournamentSize, sport]);

  // Simulate a single match
  const handleSimulateMatch = (roundIdx: number, matchIdx: number) => {
    if (!tournament) return;
    const match = tournament.rounds[roundIdx].matches[matchIdx];
    if (!match.teamA || !match.teamB || match.result) return;

    // Simulate
    const result = simulateUniversalMatch(match.teamA, match.teamB, undefined, undefined, {
      allowExtraTime: true,
      allowPenalties: true
    });

    soundFx.playWhistle();

    const winner = result.winnerId === match.teamA.id ? match.teamA : match.teamB;

    const updatedRounds = [...tournament.rounds];
    updatedRounds[roundIdx].matches[matchIdx] = {
      ...match,
      result,
      winner
    };

    // Propagate to next round if available
    if (roundIdx + 1 < updatedRounds.length) {
      const nextMatchIdx = Math.floor(matchIdx / 2);
      const isTeamA = matchIdx % 2 === 0;
      const targetMatch = updatedRounds[roundIdx + 1].matches[nextMatchIdx];

      if (isTeamA) {
        targetMatch.teamA = winner;
      } else {
        targetMatch.teamB = winner;
      }
    }

    // Check if tournament is finished (Grand final has a winner)
    let isFinished = false;
    let champion: Team | undefined = undefined;
    let runnerUp: Team | undefined = undefined;

    const finalMatch = updatedRounds[updatedRounds.length - 1].matches[0];
    if (finalMatch?.result && finalMatch.winner) {
      isFinished = true;
      champion = finalMatch.winner;
      runnerUp = finalMatch.winner.id === finalMatch.teamA?.id ? finalMatch.teamB : finalMatch.teamA;
      
      soundFx.playChampionFanfare();
      try {
        confetti({ particleCount: 150, spread: 90, origin: { y: 0.5 } });
      } catch {
        // Confetti fallback
      }
    }

    setTournament({
      ...tournament,
      rounds: updatedRounds,
      isFinished,
      champion,
      runnerUp
    });
  };

  // Simulate all remaining matches in current round
  const handleSimulateRound = () => {
    if (!tournament) return;
    const currentRoundIdx = tournament.rounds.findIndex(r => r.matches.some(m => !m.result && m.teamA && m.teamB));
    if (currentRoundIdx === -1) return;

    tournament.rounds[currentRoundIdx].matches.forEach((m, idx) => {
      if (!m.result && m.teamA && m.teamB) {
        handleSimulateMatch(currentRoundIdx, idx);
      }
    });
  };

  // Simulate entire remaining tournament instantly
  const handleSimulateAll = () => {
    if (!tournament) return;
    
    tournament.rounds.forEach((round, rIdx) => {
      round.matches.forEach((_, mIdx) => {
        // Need to fetch latest state
        handleSimulateMatch(rIdx, mIdx);
      });
    });
  };

  if (!tournament) return null;

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* Top Header & Size Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <Trophy className="w-5 h-5" />
            </span>
            <div>
              <h2 className="text-xl font-extrabold text-white tracking-wide">
                Championship Knockout Cup
              </h2>
              <p className="text-xs text-slate-400">
                Live multi-round bracket simulator with extra time & penalty deciders
              </p>
            </div>
          </div>
        </div>

        {/* Size & Action controls */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Size picker */}
          <div className="flex items-center bg-slate-950 rounded-lg p-1 border border-slate-800 text-xs">
            {[4, 8, 16].map((size) => (
              <button
                key={size}
                id={`btn-tourney-size-${size}`}
                onClick={() => setTournamentSize(size as any)}
                className={`px-3 py-1 rounded-md font-bold transition-all ${
                  tournamentSize === size
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {size} Teams
              </button>
            ))}
          </div>

          <button
            id="btn-reset-tourney"
            onClick={() => initTournament(tournamentSize)}
            title="Reset & Reshuffle Tournament"
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Cup</span>
          </button>

          {!tournament.isFinished && (
            <>
              <button
                id="btn-tourney-sim-round"
                onClick={handleSimulateRound}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-emerald-500/30 text-emerald-300 text-xs font-bold transition-all"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                <span>Sim Round</span>
              </button>

              <button
                id="btn-tourney-sim-all"
                onClick={handleSimulateAll}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-xs font-black shadow-md shadow-emerald-500/20 transition-all"
              >
                <Zap className="w-3.5 h-3.5 fill-current text-slate-950" />
                <span>Simulate All</span>
              </button>
            </>
          )}
        </div>
      </div>

      {/* Champion Banner if finished */}
      {tournament.isFinished && tournament.champion && (
        <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-amber-500/20 border-2 border-amber-400/40 text-center space-y-2 shadow-2xl relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Crown className="w-4 h-4 text-amber-400" />
            <span>Tournament Champions</span>
          </div>

          <div className="flex items-center justify-center gap-4">
            <div 
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl shadow-xl border-2 border-amber-400"
              style={{ backgroundColor: tournament.champion.primaryColor, color: tournament.champion.textColor || '#000000' }}
            >
              {tournament.champion.badgeEmoji}
            </div>
            <div className="text-left">
              <h3 className="text-2xl sm:text-3xl font-black text-white">
                {tournament.champion.name}
              </h3>
              <p className="text-xs text-amber-300 font-semibold">
                Defeated {tournament.runnerUp?.name} in the Grand Final!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Bracket Grid */}
      <div className="overflow-x-auto pb-4 scrollbar-thin">
        <div className="flex items-stretch gap-6 sm:gap-8 min-w-[720px] py-4">
          
          {tournament.rounds.map((round, rIdx) => (
            <div key={rIdx} className="flex-1 flex flex-col justify-around min-w-[220px]">
              
              {/* Round Header */}
              <div className="text-center mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-400 bg-slate-950 px-3 py-1 rounded-full border border-slate-800">
                  {round.roundName}
                </span>
              </div>

              {/* Matches column */}
              <div className="flex flex-col justify-around gap-6 flex-1">
                {round.matches.map((match, mIdx) => {
                  const hasPlayed = !!match.result;
                  const isReady = !!match.teamA && !!match.teamB && !hasPlayed;

                  return (
                    <div
                      key={match.id}
                      className={`rounded-xl border p-3 transition-all relative ${
                        hasPlayed
                          ? 'bg-slate-950/80 border-slate-800 shadow-md'
                          : isReady
                          ? 'bg-slate-900 border-emerald-500/40 hover:border-emerald-500 shadow-lg'
                          : 'bg-slate-950/40 border-slate-800/60 opacity-60'
                      }`}
                    >
                      {/* Team A */}
                      <div className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs ${
                        match.winner?.id === match.teamA?.id ? 'bg-emerald-500/15 text-emerald-300 font-bold' : 'text-slate-300'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          <span>{match.teamA?.badgeEmoji || '❓'}</span>
                          <span className="truncate">{match.teamA?.name || 'TBD'}</span>
                        </div>
                        <span className="font-mono font-bold text-white ml-2">
                          {match.result ? match.result.scoreA : ''}
                        </span>
                      </div>

                      {/* Team B */}
                      <div className={`flex items-center justify-between py-1.5 px-2 rounded-lg text-xs mt-1 ${
                        match.winner?.id === match.teamB?.id ? 'bg-emerald-500/15 text-emerald-300 font-bold' : 'text-slate-300'
                      }`}>
                        <div className="flex items-center gap-2 truncate">
                          <span>{match.teamB?.badgeEmoji || '❓'}</span>
                          <span className="truncate">{match.teamB?.name || 'TBD'}</span>
                        </div>
                        <span className="font-mono font-bold text-white ml-2">
                          {match.result ? match.result.scoreB : ''}
                        </span>
                      </div>

                      {/* Match Actions / Status */}
                      <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                        {hasPlayed ? (
                          <button
                            onClick={() => onOpenMatchReport(match.result)}
                            className="text-[11px] text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
                          >
                            <span>Report</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        ) : isReady ? (
                          <button
                            id={`btn-sim-node-${rIdx}-${mIdx}`}
                            onClick={() => handleSimulateMatch(rIdx, mIdx)}
                            className="w-full py-1 text-center text-xs font-bold rounded bg-emerald-500 text-slate-950 hover:bg-emerald-400 transition-all flex items-center justify-center gap-1"
                          >
                            <Play className="w-3 h-3 fill-current" />
                            <span>Sim Match</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Waiting on earlier round</span>
                        )}

                        {match.result?.penaltyShootout && (
                          <span className="text-[10px] font-mono text-purple-400">
                            (pens {match.result.penaltyShootout.scoreA}-{match.result.penaltyShootout.scoreB})
                          </span>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))}

        </div>
      </div>

    </div>
  );
};
