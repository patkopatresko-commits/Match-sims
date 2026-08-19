import React, { useState } from 'react';
import { 
  Trophy, 
  BarChart3, 
  BatteryCharging, 
  Star, 
  Medal, 
  HeartPulse, 
  Copy, 
  Check, 
  RotateCcw, 
  ArrowLeft,
  FileText,
  Activity
} from 'lucide-react';
import { SimulationOutput } from '../types';

interface MatchResultDisplayProps {
  result: SimulationOutput;
  onSimulateRematch: () => void;
  onEditLineups: () => void;
}

export const MatchResultDisplay: React.FC<MatchResultDisplayProps> = ({
  result,
  onSimulateRematch,
  onEditLineups,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'raw'>('structured');

  const handleCopyRawOutput = () => {
    navigator.clipboard.writeText(result.rawFormattedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const formatGoalscorers = () => {
    if (!result.goalscorers.length) return 'None';
    return result.goalscorers
      .map(g => {
        if (g.assisterName && g.assisterName !== 'pen') {
          return `${g.scorerName} (${g.assisterName}) - ${g.minute}'`;
        } else if (g.isPenalty) {
          return `${g.scorerName} (Pen) - ${g.minute}'`;
        }
        return `${g.scorerName} - ${g.minute}'`;
      })
      .join(', ');
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Top Action Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onEditLineups}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 border border-slate-700 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Edit Lineups & Tactics</span>
          </button>

          <button
            onClick={onSimulateRematch}
            className="px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-xs font-bold flex items-center gap-1.5 border border-emerald-500/30 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Simulate Rematch</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('structured')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'structured' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Formatted View
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                viewMode === 'raw' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Raw Text
            </button>
          </div>

          <button
            id="btn-copy-match-output"
            onClick={handleCopyRawOutput}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-slate-950" />
                <span>COPIED TO CLIPBOARD!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-950" />
                <span>COPY OUTPUT</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* RAW TEXT VIEW */}
      {viewMode === 'raw' ? (
        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-2xl relative font-mono text-xs text-emerald-400 leading-relaxed overflow-x-auto whitespace-pre-wrap selection:bg-emerald-500 selection:text-slate-950">
          {result.rawFormattedText}
        </div>
      ) : (
        /* STRUCTURED OUTPUT VIEW (Strictly 6 Sections) */
        <div className="space-y-6">
          
          {/* SECTION 1: 🏆 FINAL SCORELINE */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl">🏆</span>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">
                1. FINAL SCORELINE
              </h2>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4 border-y border-slate-800/80">
              <div className="text-center sm:text-left flex-1">
                <div className="text-xl sm:text-2xl font-black text-white">{result.teamAName}</div>
              </div>

              <div className="px-6 py-2 rounded-2xl bg-slate-950 border border-slate-800 font-mono font-black text-3xl sm:text-4xl text-emerald-400 tracking-wider shadow-inner">
                {result.scoreA} - {result.scoreB}
              </div>

              <div className="text-center sm:text-right flex-1">
                <div className="text-xl sm:text-2xl font-black text-white">{result.teamBName}</div>
              </div>
            </div>

            {/* Goalscorers list */}
            <div className="mt-4 pt-2">
              <div className="text-xs font-bold text-slate-400 mb-1 uppercase tracking-wide">
                Goalscorers:
              </div>
              <p className="text-sm font-medium text-slate-200">
                {formatGoalscorers()}
              </p>
            </div>
          </div>

          {/* SECTION 2: 📊 MATCH STAT SHEET */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">📊</span>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">
                2. MATCH STAT SHEET
              </h2>
            </div>

            <div className="space-y-3 pt-2 text-xs sm:text-sm">
              {[
                {
                  label: 'Possession',
                  valA: `${result.stats.possessionA}%`,
                  valB: `${result.stats.possessionB}%`,
                  rawA: result.stats.possessionA,
                  rawB: result.stats.possessionB
                },
                {
                  label: 'Shots (On Target)',
                  valA: `${result.stats.shotsA} (${result.stats.shotsOnTargetA})`,
                  valB: `${result.stats.shotsB} (${result.stats.shotsOnTargetB})`,
                  rawA: result.stats.shotsA,
                  rawB: result.stats.shotsB
                },
                {
                  label: 'Expected Goals (xG)',
                  valA: result.stats.xgA.toFixed(2),
                  valB: result.stats.xgB.toFixed(2),
                  rawA: result.stats.xgA,
                  rawB: result.stats.xgB
                },
                {
                  label: 'Passes (Accuracy)',
                  valA: `${result.stats.passesA} (${result.stats.passAccuracyA}%)`,
                  valB: `${result.stats.passesB} (${result.stats.passAccuracyB}%)`,
                  rawA: result.stats.passesA,
                  rawB: result.stats.passesB
                },
                {
                  label: 'Fouls Committed',
                  valA: result.stats.foulsA,
                  valB: result.stats.foulsB,
                  rawA: result.stats.foulsA,
                  rawB: result.stats.foulsB
                },
                {
                  label: 'Cards (Yellow / Red)',
                  valA: `${result.stats.yellowCardsA}Y / ${result.stats.redCardsA}R`,
                  valB: `${result.stats.yellowCardsB}Y / ${result.stats.redCardsB}R`,
                  rawA: result.stats.yellowCardsA,
                  rawB: result.stats.yellowCardsB
                },
                {
                  label: 'Corner Kicks',
                  valA: result.stats.cornersA,
                  valB: result.stats.cornersB,
                  rawA: result.stats.cornersA,
                  rawB: result.stats.cornersB
                },
                {
                  label: 'Offsides',
                  valA: result.stats.offsidesA,
                  valB: result.stats.offsidesB,
                  rawA: result.stats.offsidesA,
                  rawB: result.stats.offsidesB
                }
              ].map((stat, i) => (
                <div key={i} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-between">
                  <span className="font-mono font-bold text-white w-24 text-left">
                    {stat.valA}
                  </span>
                  <span className="text-slate-400 font-medium text-center text-xs">
                    {stat.label}
                  </span>
                  <span className="font-mono font-bold text-white w-24 text-right">
                    {stat.valB}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 3: 🔋 FINAL FITNESS SHEET */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">🔋</span>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">
                3. FINAL FITNESS SHEET
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Team A Fitness */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 pb-1 border-b border-slate-800">
                  {result.teamAName} (Remaining Stamina)
                </h3>
                <div className="space-y-1.5">
                  {result.playerResultsA.map(p => (
                    <div key={p.playerId} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/70 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-emerald-400/80 font-bold w-5">#{p.number}</span>
                        <span className="text-slate-300 font-medium">{p.name} <span className="text-[10px] text-slate-500 font-mono">({p.position})</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${p.remainingStamina < 40 ? 'bg-rose-500' : (p.remainingStamina < 70 ? 'bg-amber-400' : 'bg-emerald-500')}`}
                            style={{ width: `${p.remainingStamina}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200 text-[11px] w-8 text-right">{p.remainingStamina}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team B Fitness */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 pb-1 border-b border-slate-800">
                  {result.teamBName} (Remaining Stamina)
                </h3>
                <div className="space-y-1.5">
                  {result.playerResultsB.map(p => (
                    <div key={p.playerId} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/70 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-cyan-400/80 font-bold w-5">#{p.number}</span>
                        <span className="text-slate-300 font-medium">{p.name} <span className="text-[10px] text-slate-500 font-mono">({p.position})</span></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${p.remainingStamina < 40 ? 'bg-rose-500' : (p.remainingStamina < 70 ? 'bg-amber-400' : 'bg-emerald-500')}`}
                            style={{ width: `${p.remainingStamina}%` }}
                          />
                        </div>
                        <span className="font-mono font-bold text-slate-200 text-[11px] w-8 text-right">{p.remainingStamina}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 4: ⭐ INDIVIDUAL PLAYER RATINGS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">⭐</span>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">
                4. INDIVIDUAL PLAYER RATINGS (1.0 to 10.0 Scale)
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Team A Ratings */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 pb-1 border-b border-slate-800">
                  {result.teamAName}
                </h3>
                <div className="space-y-1.5">
                  {result.playerResultsA.map(p => (
                    <div key={p.playerId} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/70 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-emerald-400/80 font-bold w-5">#{p.number}</span>
                        <span className="text-slate-300 font-medium">{p.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({p.position})</span>
                        {p.goals > 0 && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded">⚽ {p.goals}</span>}
                        {p.assists > 0 && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1 rounded">🅰️ {p.assists}</span>}
                        {p.yellowCards > 0 && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">🟨</span>}
                        {p.redCard && <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 rounded">🟥</span>}
                      </div>
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        p.rating >= 8.0 ? 'bg-emerald-500/20 text-emerald-400' : (p.rating >= 7.0 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-300')
                      }`}>
                        {p.rating.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Team B Ratings */}
              <div className="space-y-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-cyan-400 pb-1 border-b border-slate-800">
                  {result.teamBName}
                </h3>
                <div className="space-y-1.5">
                  {result.playerResultsB.map(p => (
                    <div key={p.playerId} className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800/70 text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] text-cyan-400/80 font-bold w-5">#{p.number}</span>
                        <span className="text-slate-300 font-medium">{p.name}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({p.position})</span>
                        {p.goals > 0 && <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-1 rounded">⚽ {p.goals}</span>}
                        {p.assists > 0 && <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1 rounded">🅰️ {p.assists}</span>}
                        {p.yellowCards > 0 && <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded">🟨</span>}
                        {p.redCard && <span className="text-[10px] bg-rose-500/20 text-rose-300 px-1 rounded">🟥</span>}
                      </div>
                      <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                        p.rating >= 8.0 ? 'bg-emerald-500/20 text-emerald-400' : (p.rating >= 7.0 ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-300')
                      }`}>
                        {p.rating.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 5: 🏅 MAN OF THE MATCH (MOTM) */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">🏅</span>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">
                5. MAN OF THE MATCH (MOTM)
              </h2>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-base text-white">{result.manOfTheMatch.playerName}</span>
                  <span className="text-xs text-slate-400">({result.manOfTheMatch.teamName})</span>
                </div>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  {result.manOfTheMatch.summary}
                </p>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 font-mono font-black text-sm shrink-0 self-start sm:self-center">
                {result.manOfTheMatch.rating.toFixed(1)} / 10.0
              </div>
            </div>
          </div>

          {/* SECTION 6: 🏥 MEDICAL REPORT */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">🏥</span>
              <h2 className="font-extrabold text-sm uppercase tracking-wider text-slate-300">
                6. MEDICAL REPORT
              </h2>
            </div>

            <div className="space-y-2 pt-1">
              {result.medicalReport.map((line, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800/70 text-xs text-slate-300 flex items-center gap-2">
                  <HeartPulse className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{line}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
