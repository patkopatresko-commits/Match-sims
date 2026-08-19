import React, { useState, useEffect, useRef } from 'react';
import { 
  FastForward, 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Flag, 
  Flame, 
  Activity, 
  CheckCircle2, 
  ArrowRight,
  TrendingUp
} from 'lucide-react';
import { MatchResult, MatchEvent, TacticType } from '../types';
import { soundFx } from '../utils/audio';

interface LiveMatchVisualizerProps {
  matchResult: MatchResult;
  onFinish: (result: MatchResult) => void;
  onCancel: () => void;
}

export const LiveMatchVisualizer: React.FC<LiveMatchVisualizerProps> = ({
  matchResult,
  onFinish,
  onCancel,
}) => {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1); // 1x, 2x, 5x, 10x
  const [ballPos, setBallPos] = useState({ x: 50, y: 50 });
  const [momentum, setMomentum] = useState(0); // -100 to 100
  const [visibleEvents, setVisibleEvents] = useState<MatchEvent[]>([]);
  const [currentScore, setCurrentScore] = useState<[number, number]>([0, 0]);
  const [goalCelebration, setGoalCelebration] = useState<string | null>(null);

  const eventFeedRef = useRef<HTMLDivElement>(null);
  const events = matchResult.events;

  // Auto-scroll event feed
  useEffect(() => {
    if (eventFeedRef.current) {
      eventFeedRef.current.scrollTop = eventFeedRef.current.scrollHeight;
    }
  }, [visibleEvents]);

  // Main simulation timer loop
  useEffect(() => {
    if (!isPlaying) return;

    if (currentEventIndex >= events.length) {
      // Finished match!
      const timer = setTimeout(() => {
        soundFx.playWhistle();
        onFinish(matchResult);
      }, 1200);
      return () => clearTimeout(timer);
    }

    const currentEvt = events[currentEventIndex];
    const isHighlight = currentEvt.isHighlight;
    const baseDelay = isHighlight ? 1800 : 1000;
    const interval = Math.max(120, baseDelay / playbackSpeed);

    const timer = setTimeout(() => {
      // Process event
      setVisibleEvents(prev => [...prev, currentEvt]);
      setCurrentScore(currentEvt.scoreSnapshot);

      // Trigger audio & pitch animation based on event type
      if (currentEvt.type === 'goal' || currentEvt.type === 'penalty_scored') {
        soundFx.playGoalCheer();
        setGoalCelebration(`GOAL! ${currentEvt.player || ''}`);
        setTimeout(() => setGoalCelebration(null), 2000);
      } else if (currentEvt.type === 'three_pointer' || currentEvt.type === 'dunk') {
        soundFx.playGoalCheer();
      } else if (currentEvt.type === 'save') {
        soundFx.playHit();
      } else if (currentEvt.type === 'card_yellow' || currentEvt.type === 'card_red') {
        soundFx.playWhistle();
      }

      // Update ball coordinates
      if (currentEvt.fieldCoordinates) {
        setBallPos(currentEvt.fieldCoordinates);
      } else {
        const isTeamA = currentEvt.teamId === matchResult.teamA.id;
        setBallPos({
          x: isTeamA ? Math.floor(Math.random() * 30 + 60) : Math.floor(Math.random() * 30 + 10),
          y: Math.floor(Math.random() * 60 + 20)
        });
      }

      // Update momentum bar
      const isTeamA = currentEvt.teamId === matchResult.teamA.id;
      setMomentum(prev => {
        const delta = isTeamA ? 25 : -25;
        return Math.max(-95, Math.min(95, prev * 0.7 + delta));
      });

      setCurrentEventIndex(prev => prev + 1);
    }, interval);

    return () => clearTimeout(timer);
  }, [currentEventIndex, isPlaying, playbackSpeed, events, matchResult, onFinish]);

  const latestEvent = visibleEvents[visibleEvents.length - 1];
  const progressPercent = Math.min(100, Math.round((currentEventIndex / events.length) * 100));

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 sm:p-6 relative overflow-hidden flex flex-col gap-5">
      
      {/* Goal Celebration Overlay */}
      {goalCelebration && (
        <div className="absolute inset-0 z-30 bg-emerald-500/20 backdrop-blur-xs flex items-center justify-center pointer-events-none animate-pulse">
          <div className="bg-slate-950/90 border-2 border-emerald-400 text-emerald-300 px-8 py-4 rounded-2xl shadow-2xl text-2xl sm:text-4xl font-black tracking-wider text-center transform scale-110 transition-transform">
            ⚡ {goalCelebration} ⚡
          </div>
        </div>
      )}

      {/* Top Bar: Match Controls & Clock */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
          <span className="text-xs font-bold uppercase tracking-widest text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            LIVE SIMULATION
          </span>
          <span className="text-xs font-mono font-semibold text-slate-300">
            {latestEvent ? `${latestEvent.phase || ''} ${latestEvent.minute}'` : 'Kickoff'}
          </span>
        </div>

        {/* Speed Controls & Skip */}
        <div className="flex items-center gap-2">
          
          <div className="flex items-center bg-slate-950 rounded-lg p-0.5 border border-slate-800">
            {[1, 2, 5, 10].map(speed => (
              <button
                key={speed}
                onClick={() => setPlaybackSpeed(speed)}
                className={`px-2 py-1 text-[11px] font-bold rounded-md transition-all ${
                  playbackSpeed === speed
                    ? 'bg-emerald-500 text-slate-950'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {speed}x
              </button>
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white transition-all"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 text-emerald-400" />}
          </button>

          <button
            id="btn-skip-to-fulltime"
            onClick={() => onFinish(matchResult)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 text-xs font-extrabold shadow-md transition-all"
          >
            <span>Skip to Result</span>
            <FastForward className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white text-xs"
            title="Cancel Match"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Main Scoreboard Display */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 p-4 sm:p-6 shadow-inner">
        <div className="grid grid-cols-11 items-center gap-2">
          
          {/* Team A Side */}
          <div className="col-span-4 flex items-center justify-end gap-3 text-right">
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-xl text-white truncate">
                {matchResult.teamA.name}
              </h3>
              <p className="text-xs text-emerald-400 font-mono hidden sm:block">
                {matchResult.tacticA}
              </p>
            </div>
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border border-slate-700 shadow-md"
              style={{ backgroundColor: matchResult.teamA.primaryColor, color: matchResult.teamA.textColor || '#000000' }}
            >
              {matchResult.teamA.badgeEmoji}
            </div>
          </div>

          {/* Center Score */}
          <div className="col-span-3 flex flex-col items-center justify-center">
            <div className="flex items-center gap-2 sm:gap-4 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 shadow-lg">
              <span className="text-2xl sm:text-4xl font-black font-mono text-white">
                {currentScore[0]}
              </span>
              <span className="text-slate-600 font-bold text-xl">:</span>
              <span className="text-2xl sm:text-4xl font-black font-mono text-white">
                {currentScore[1]}
              </span>
            </div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-1.5">
              {matchResult.venue}
            </div>
          </div>

          {/* Team B Side */}
          <div className="col-span-4 flex items-center justify-start gap-3 text-left">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 border border-slate-700 shadow-md"
              style={{ backgroundColor: matchResult.teamB.primaryColor, color: matchResult.teamB.textColor || '#000000' }}
            >
              {matchResult.teamB.badgeEmoji}
            </div>
            <div className="min-w-0">
              <h3 className="font-extrabold text-base sm:text-xl text-white truncate">
                {matchResult.teamB.name}
              </h3>
              <p className="text-xs text-cyan-400 font-mono hidden sm:block">
                {matchResult.tacticB}
              </p>
            </div>
          </div>

        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden mt-4">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Split: Pitch Radar (Left) + Live Commentary Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
        
        {/* Interactive Pitch Radar */}
        <div className="lg:col-span-7 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Pitch Radar</span>
            </span>
            <span className="text-[11px] text-slate-500">
              Ball Active Zone
            </span>
          </div>

          {/* 2D Pitch Diagram */}
          <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden border border-emerald-500/30 bg-pitch-pattern shadow-inner flex items-center justify-center">
            {/* Center Circle */}
            <div className="absolute w-24 h-24 rounded-full border border-white/20" />
            {/* Halfway Line */}
            <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20" />
            {/* Left Penalty Box */}
            <div className="absolute left-0 top-1/4 bottom-1/4 w-1/6 border-r border-t border-b border-white/20" />
            {/* Right Penalty Box */}
            <div className="absolute right-0 top-1/4 bottom-1/4 w-1/6 border-l border-t border-b border-white/20" />

            {/* Team Badges on pitch sides */}
            <div className="absolute left-4 top-4 text-xs font-bold px-2 py-1 rounded bg-slate-950/70 text-emerald-300 border border-emerald-500/30">
              {matchResult.teamA.shortName}
            </div>
            <div className="absolute right-4 top-4 text-xs font-bold px-2 py-1 rounded bg-slate-950/70 text-cyan-300 border border-cyan-500/30">
              {matchResult.teamB.shortName}
            </div>

            {/* Animated Ball Position */}
            <div 
              className="absolute w-4 h-4 rounded-full bg-white shadow-[0_0_12px_#ffffff] border-2 border-slate-950 transition-all duration-500 ease-out transform -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${ballPos.x}%`, top: `${ballPos.y}%` }}
            >
              <div className="w-full h-full rounded-full animate-ping bg-emerald-400 opacity-60" />
            </div>
          </div>

          {/* Dynamic Momentum Meter */}
          <div className="mt-3 pt-3 border-t border-slate-800">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400 mb-1">
              <span className="text-emerald-400">{matchResult.teamA.shortName} Pressure</span>
              <span className="flex items-center gap-1 text-slate-300">
                <TrendingUp className="w-3 h-3 text-amber-400" />
                <span>Match Momentum</span>
              </span>
              <span className="text-cyan-400">{matchResult.teamB.shortName} Pressure</span>
            </div>
            <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden flex">
              <div 
                className="h-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${50 + momentum / 2}%` }}
              />
              <div 
                className="h-full bg-cyan-500 transition-all duration-500"
                style={{ width: `${50 - momentum / 2}%` }}
              />
            </div>
          </div>
        </div>

        {/* Live Event Ticker Feed */}
        <div className="lg:col-span-5 bg-slate-950 rounded-2xl border border-slate-800 p-4 flex flex-col h-[340px]">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Play-by-Play Events ({visibleEvents.length})
            </span>
            <span className="text-[11px] text-emerald-400 font-mono">
              Live Feed
            </span>
          </div>

          {/* Event Stream */}
          <div 
            ref={eventFeedRef}
            className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin"
          >
            {visibleEvents.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-500 italic">
                Awaiting kickoff...
              </div>
            ) : (
              visibleEvents.map((evt, idx) => {
                const isTeamA = evt.teamId === matchResult.teamA.id;
                const isGoal = evt.type === 'goal' || evt.type === 'penalty_scored' || evt.type === 'three_pointer' || evt.type === 'dunk';
                
                return (
                  <div 
                    key={evt.id || idx}
                    className={`p-2.5 rounded-xl border text-xs transition-all ${
                      isGoal 
                        ? 'bg-emerald-500/15 border-emerald-500/50 text-white font-semibold' 
                        : evt.type === 'card_yellow' || evt.type === 'card_red'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                        : evt.type === 'save'
                        ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-200'
                        : 'bg-slate-900/80 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-1.5 font-bold font-mono">
                        <span className="text-slate-400">{evt.minute}'</span>
                        <span className={isTeamA ? 'text-emerald-400' : 'text-cyan-400'}>
                          {isTeamA ? matchResult.teamA.shortName : matchResult.teamB.shortName}
                        </span>
                      </div>
                      <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-950 text-slate-400">
                        {evt.type.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs leading-relaxed">{evt.description}</p>
                  </div>
                );
              })
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
