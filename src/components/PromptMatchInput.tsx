import React from 'react';
import { 
  Zap, 
  FileText, 
  RotateCcw, 
  CheckCircle2,
  ShieldAlert
} from 'lucide-react';
import { parseMatchPrompt } from '../utils/promptParser';

interface PromptMatchInputProps {
  promptText: string;
  onPromptChange: (text: string) => void;
  onSimulate: () => void;
}

export const PromptMatchInput: React.FC<PromptMatchInputProps> = ({
  promptText,
  onPromptChange,
  onSimulate,
}) => {
  const parsed = parseMatchPrompt(promptText);

  return (
    <div className="w-full space-y-4">
      
      {/* Prompt Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl space-y-4">
        
        {/* Header without suggestions */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight">
                Enter Match Prompt
              </h2>
              <p className="text-xs text-slate-400">
                Type your team names, custom tactical instructions, and player lineups below.
              </p>
            </div>
          </div>

          {promptText && (
            <button
              onClick={() => onPromptChange('')}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Text</span>
            </button>
          )}
        </div>

        {/* Large Text Area for Pure Custom User Input */}
        <div className="space-y-1.5">
          <textarea
            id="custom-match-prompt-input"
            rows={16}
            value={promptText}
            onChange={(e) => onPromptChange(e.target.value)}
            placeholder={`Type your match setup here. For example:

Team A: Arsenal
Formation: 4-3-3
Tactics: High press, attacking mentality, direct high tempo, normal tackling
Lineup:
1. Raya (GK) 86 OVR 7.8 form
2. Ben White (DF) 85 OVR 7.5 form
3. Saliba (DF) 89 OVR 8.2 form
4. Gabriel (DF) 87 OVR 7.9 form
5. Timber (DF) 83 OVR 7.4 form
6. Partey (MF) 84 OVR 7.2 form
7. Declan Rice (MF) 88 OVR 8.1 form
8. Odegaard (MF) 89 OVR 8.3 form
9. Saka (FW) 88 OVR 8.4 form
10. Havertz (FW) 85 OVR 7.7 form
11. Martinelli (FW) 85 OVR 7.5 form

Team B: Chelsea
Formation: 4-2-3-1
Tactics: Mid block, balanced mentality, patient tempo, aggressive tackling
Lineup:
1. Robert Sanchez (GK) 81 OVR 7.2 form
2. Reece James (DF) 84 OVR 7.5 form
3. Wesley Fofana (DF) 82 OVR 7.3 form
4. Levi Colwill (DF) 83 OVR 7.6 form
5. Marc Cucurella (DF) 82 OVR 7.4 form
6. Moises Caicedo (MF) 86 OVR 8.0 form
7. Enzo Fernandez (MF) 84 OVR 7.5 form
8. Noni Madueke (FW) 82 OVR 7.4 form
9. Cole Palmer (MF) 88 OVR 8.5 form
10. Pedro Neto (FW) 83 OVR 7.5 form
11. Nicolas Jackson (FW) 82 OVR 7.4 form

Venue: Neutral
Weather: Clear / Mild
Referee: Standard`}
            className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-100 font-mono text-xs sm:text-sm leading-relaxed focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 selection:bg-emerald-500 selection:text-slate-950 resize-y"
          />
        </div>

        {/* Real-Time Live Parsed Feedback */}
        {promptText.trim().length > 0 && (
          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-slate-400">Parsed:</span>
                <strong className="text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {parsed.teamA.name}
                </strong>
                <span className="text-slate-500 font-mono text-[11px]">({parsed.teamA.tactics.formation})</span>
                <span className="text-slate-500">vs</span>
                <strong className="text-white bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                  {parsed.teamB.name}
                </strong>
                <span className="text-slate-500 font-mono text-[11px]">({parsed.teamB.tactics.formation})</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 font-mono flex items-center gap-2">
              <span>{parsed.teamA.startingXI.length} Players</span>
              <span>•</span>
              <span>{parsed.teamB.startingXI.length} Players</span>
            </div>
          </div>
        )}

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

    </div>
  );
};
