import React, { useState } from 'react';
import { 
  Trophy, 
  RotateCcw, 
  Share2, 
  Check, 
  Award, 
  Zap, 
  Percent, 
  ShieldCheck, 
  Swords, 
  Clock, 
  Flame,
  Layers,
  ChevronRight,
  Shuffle
} from 'lucide-react';
import { MatchResult } from '../types';
import confetti from 'canvas-confetti';

interface MatchSummaryModalProps {
  result: MatchResult;
  onClose: () => void;
  onRematch: (inverse: boolean) => void;
}

export const MatchSummaryModal: React.FC<MatchSummaryModalProps> = ({
  result,
  onClose,
  onRematch,
}) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'events' | 'lineups'>('stats');
  const [copied, setCopied] = useState(false);

  // Trigger celebration confetti on mount if there's a winner
  React.useEffect(() => {
    if (result.winnerId !== 'draw') {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Safe fallback
      }
    }
  }, [result]);

  const teamA = result.teamA;
  const teamB = result.teamB;
  const stats = result.stats;

  const isWinnerA = result.winnerId === teamA.id;
  const isWinnerB = result.winnerId === teamB.id;
  const isDraw = result.winnerId === 'draw';

  const handleCopyReport = () => {
    const winnerText = isDraw ? 'Match ended in a DRAW' : `Winner: ${isWinnerA ? teamA.name : teamB.name}`;
    const reportText = `🏆 MATCH QUICK SIMULÁTOR REPORT 🏆
⚽ ${teamA.name} ${result.scoreA} - ${result.scoreB} ${teamB.name}
${result.penaltyShootout ? `(Penalties: ${result.penaltyShootout.scoreA} - ${result.penaltyShootout.scoreB})` : ''}
📍 Venue: ${result.venue} | Weather: ${result.weather}
🌟 Man of the Match: ${result.manOfTheMatch.name} (${result.manOfTheMatch.rating}/10)
📊 Possession: ${stats.possession[0]}% - ${stats.possession[1]}%
🎯 Shots (On Target): ${stats.shots[0]}(${stats.shotsOnTarget[0]}) - ${stats.shots[1]}(${stats.shotsOnTarget[1]})
⚡ Result: ${winnerText}
Simulated on Match Quick Simulátor!`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]">
        
        {/* Header Ribbon & Close */}
        <div className="p-4 sm:p-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                FINAL MATCH REPORT
              </span>
              {result.wentToExtraTime && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  AET
                </span>
              )}
              {result.wentToPenalties && (
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  PEN
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                id="btn-copy-match-report"
                onClick={handleCopyReport}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Share Result'}</span>
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center text-sm"
              >
                ✕
              </button>
            </div>
          </div>

          {/* Teams Final Score Banner */}
          <div className="grid grid-cols-11 items-center gap-2 sm:gap-4 py-2">
            
            {/* Team A */}
            <div className="col-span-4 flex items-center justify-end gap-3 text-right">
              <div className="min-w-0">
                <h3 className={`font-black text-base sm:text-2xl truncate ${isWinnerA ? 'text-emerald-400' : 'text-white'}`}>
                  {teamA.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono hidden sm:block">
                  {teamA.shortName} • {result.tacticA}
                </p>
              </div>
              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg border-2 ${isWinnerA ? 'border-emerald-400 ring-2 ring-emerald-500/30' : 'border-slate-700'}`}
                style={{ backgroundColor: teamA.primaryColor, color: teamA.textColor || '#000000' }}
              >
                {teamA.badgeEmoji}
              </div>
            </div>

            {/* Final Score */}
            <div className="col-span-3 flex flex-col items-center justify-center">
              <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800 shadow-inner">
                <span className={`text-3xl sm:text-5xl font-black font-mono ${isWinnerA ? 'text-emerald-400' : 'text-white'}`}>
                  {result.scoreA}
                </span>
                <span className="text-slate-600 font-black text-2xl">-</span>
                <span className={`text-3xl sm:text-5xl font-black font-mono ${isWinnerB ? 'text-emerald-400' : 'text-white'}`}>
                  {result.scoreB}
                </span>
              </div>
              
              {/* Penalty shootout subscore */}
              {result.penaltyShootout && (
                <div className="text-xs font-mono font-bold text-purple-400 mt-1.5">
                  ({result.penaltyShootout.scoreA} - {result.penaltyShootout.scoreB} on pens)
                </div>
              )}
            </div>

            {/* Team B */}
            <div className="col-span-4 flex items-center justify-start gap-3 text-left">
              <div 
                className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-lg border-2 ${isWinnerB ? 'border-emerald-400 ring-2 ring-emerald-500/30' : 'border-slate-700'}`}
                style={{ backgroundColor: teamB.primaryColor, color: teamB.textColor || '#000000' }}
              >
                {teamB.badgeEmoji}
              </div>
              <div className="min-w-0">
                <h3 className={`font-black text-base sm:text-2xl truncate ${isWinnerB ? 'text-emerald-400' : 'text-white'}`}>
                  {teamB.name}
                </h3>
                <p className="text-xs text-slate-400 font-mono hidden sm:block">
                  {teamB.shortName} • {result.tacticB}
                </p>
              </div>
            </div>

          </div>

          {/* Winner Banner */}
          <div className="mt-3 text-center">
            {isDraw ? (
              <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-full border border-slate-700">
                🤝 Stalemated in a Draw
              </span>
            ) : (
              <span className="text-xs font-extrabold text-emerald-300 bg-emerald-500/20 px-4 py-1 rounded-full border border-emerald-500/40 inline-flex items-center gap-1.5 shadow-sm">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                <span>{isWinnerA ? teamA.name : teamB.name} Victorious!</span>
              </span>
            )}
          </div>
        </div>

        {/* Man of the Match Spotlight */}
        <div className="px-4 sm:px-6 py-3 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-amber-400 tracking-wider">
                Man of the Match
              </div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>{result.manOfTheMatch.name}</span>
                <span className="text-xs text-slate-400 font-normal">({result.manOfTheMatch.teamName})</span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-black font-mono text-emerald-400">
              {result.manOfTheMatch.rating}
              <span className="text-xs text-slate-500">/10</span>
            </div>
            <div className="text-[10px] text-slate-400">Performance Rating</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 px-4 sm:px-6 bg-slate-900">
          {[
            { id: 'stats', label: 'Match Statistics' },
            { id: 'events', label: `Highlights (${result.events.filter(e => e.isHighlight).length})` },
            { id: 'lineups', label: 'Rosters & Tactics' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Body Content */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 space-y-4 scrollbar-thin">
          
          {/* STATS TAB */}
          {activeTab === 'stats' && (
            <div className="space-y-4">
              
              {/* Stat Comparison Bars */}
              {[
                { label: 'Possession', valA: `${stats.possession[0]}%`, valB: `${stats.possession[1]}%`, pA: stats.possession[0], pB: stats.possession[1] },
                { label: 'Total Shots', valA: stats.shots[0], valB: stats.shots[1], pA: stats.shots[0], pB: stats.shots[1] },
                { label: 'Shots on Target', valA: stats.shotsOnTarget[0], valB: stats.shotsOnTarget[1], pA: stats.shotsOnTarget[0], pB: stats.shotsOnTarget[1] },
                { label: 'Expected Goals (xG)', valA: stats.xG[0], valB: stats.xG[1], pA: stats.xG[0] * 10, pB: stats.xG[1] * 10 },
                { label: 'Goalkeeper Saves', valA: stats.saves[0], valB: stats.saves[1], pA: stats.saves[0], pB: stats.saves[1] },
                { label: 'Corners', valA: stats.corners[0], valB: stats.corners[1], pA: stats.corners[0], pB: stats.corners[1] },
                { label: 'Fouls Committed', valA: stats.fouls[0], valB: stats.fouls[1], pA: stats.fouls[0], pB: stats.fouls[1] },
                { label: 'Yellow Cards', valA: stats.yellowCards[0], valB: stats.yellowCards[1], pA: stats.yellowCards[0], pB: stats.yellowCards[1] },
                { label: 'Pass Accuracy', valA: `${stats.passAccuracy[0]}%`, valB: `${stats.passAccuracy[1]}%`, pA: stats.passAccuracy[0], pB: stats.passAccuracy[1] },
              ].map((stat, idx) => {
                const total = (typeof stat.pA === 'number' ? stat.pA : 1) + (typeof stat.pB === 'number' ? stat.pB : 1) || 1;
                const widthA = Math.round(((typeof stat.pA === 'number' ? stat.pA : 1) / total) * 100);
                const widthB = 100 - widthA;

                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <span className="text-emerald-400 font-mono">{stat.valA}</span>
                      <span className="text-slate-400 text-[11px] font-medium">{stat.label}</span>
                      <span className="text-cyan-400 font-mono">{stat.valB}</span>
                    </div>
                    <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-500 transition-all duration-500"
                        style={{ width: `${widthA}%` }}
                      />
                      <div 
                        className="h-full bg-cyan-500 transition-all duration-500"
                        style={{ width: `${widthB}%` }}
                      />
                    </div>
                  </div>
                );
              })}

              {/* Match Venue & Details info */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-4 border-t border-slate-800 text-center">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Venue</div>
                  <div className="text-xs font-semibold text-slate-200 truncate">{result.venue}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Weather</div>
                  <div className="text-xs font-semibold text-slate-200">{result.weather}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Attendance</div>
                  <div className="text-xs font-semibold text-slate-200 font-mono">{result.crowdAttendance?.toLocaleString() || '65,000'}</div>
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <div className="text-[10px] text-slate-500 uppercase">Competition</div>
                  <div className="text-xs font-semibold text-emerald-400 truncate">{teamA.league || 'Simulated Championship'}</div>
                </div>
              </div>

            </div>
          )}

          {/* EVENTS / TIMELINE TAB */}
          {activeTab === 'events' && (
            <div className="space-y-2.5">
              {result.events.map((evt, idx) => {
                const isTeamA = evt.teamId === teamA.id;
                const isGoal = evt.type === 'goal' || evt.type === 'penalty_scored' || evt.type === 'three_pointer' || evt.type === 'dunk';
                
                return (
                  <div 
                    key={evt.id || idx}
                    className={`p-3 rounded-xl border flex items-start gap-3 transition-all ${
                      isGoal
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white'
                        : evt.type === 'card_yellow' || evt.type === 'card_red'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div className="w-10 text-center shrink-0">
                      <span className="font-mono font-bold text-xs px-1.5 py-0.5 rounded bg-slate-900 text-slate-300">
                        {evt.minute}'
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={`text-xs font-bold ${isTeamA ? 'text-emerald-400' : 'text-cyan-400'}`}>
                          {isTeamA ? teamA.name : teamB.name}
                        </span>
                        {evt.player && (
                          <span className="text-xs font-semibold text-white bg-slate-900 px-2 py-0.2 rounded border border-slate-700">
                            {evt.player}
                          </span>
                        )}
                        {evt.assistPlayer && (
                          <span className="text-[11px] text-slate-400">
                            (ast. {evt.assistPlayer})
                          </span>
                        )}
                      </div>
                      <p className="text-xs leading-relaxed">{evt.description}</p>
                    </div>

                    <div className="text-right font-mono text-xs font-bold text-slate-400 shrink-0">
                      [{evt.scoreSnapshot[0]} - {evt.scoreSnapshot[1]}]
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LINEUPS TAB */}
          {activeTab === 'lineups' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              {/* Team A Lineup */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-emerald-400 text-sm">{teamA.name}</h4>
                  <span className="text-xs text-slate-400 font-mono">{teamA.formation || '4-3-3'}</span>
                </div>
                <div className="space-y-1.5">
                  {teamA.players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/60 border border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono w-4">{p.number}</span>
                        <span className="font-semibold text-slate-200">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{p.position}</span>
                        <span className="font-mono font-bold text-emerald-400">{p.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team B Lineup */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <h4 className="font-bold text-cyan-400 text-sm">{teamB.name}</h4>
                  <span className="text-xs text-slate-400 font-mono">{teamB.formation || '4-3-3'}</span>
                </div>
                <div className="space-y-1.5">
                  {teamB.players.map((p) => (
                    <div key={p.id} className="flex items-center justify-between text-xs py-1 px-2 rounded bg-slate-900/60 border border-slate-800/60">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 font-mono w-4">{p.number}</span>
                        <span className="font-semibold text-slate-200">{p.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400">{p.position}</span>
                        <span className="font-mono font-bold text-cyan-400">{p.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-6 bg-slate-950 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition-all"
          >
            Back to Matchmaker
          </button>

          <div className="flex items-center gap-2">
            <button
              id="btn-invert-rematch"
              onClick={() => onRematch(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-all border border-slate-700"
            >
              <Shuffle className="w-3.5 h-3.5 text-amber-400" />
              <span>Invert & Rematch</span>
            </button>

            <button
              id="btn-instant-rematch"
              onClick={() => onRematch(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 text-xs font-extrabold shadow-md shadow-emerald-500/20 transition-all"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Play Rematch</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
