export type Position = 'GK' | 'DF' | 'MF' | 'FW';

export interface FootballPlayer {
  id: string;
  name: string;
  number: number;
  position: Position;
  overall: number; // 1-99
  form: number; // 1.0 - 10.0 (recent form rating)
  startingStamina: number; // 1-100%
}

export type Mentality = 'Ultra Defensive' | 'Defensive' | 'Balanced' | 'Attacking' | 'All-Out Attack';
export type Tempo = 'Slow & Patient' | 'Standard' | 'Direct & High Tempo';
export type Pressing = 'Low Block' | 'Mid Block' | 'High Press & Counter-Press';
export type Tackling = 'Cautious' | 'Normal' | 'Aggressive';

export interface TacticalInstructions {
  formation: string;
  mentality: Mentality;
  tempo: Tempo;
  pressing: Pressing;
  tackling: Tackling;
  customNotes?: string;
}

export interface FootballTeamInput {
  id: string;
  name: string;
  badgeEmoji: string;
  startingXI: FootballPlayer[];
  bench: FootballPlayer[];
  tactics: TacticalInstructions;
}

export interface MatchVariables {
  venue: 'Neutral' | 'Team A Home' | 'Team B Home';
  weather: 'Clear / Mild' | 'Heavy Rain (Slick Pitch)' | 'Extreme Heat (High Fatigue)' | 'Snow / Freezing';
  refereeStrictness: 'Lenient' | 'Standard' | 'Strict';
  extraTime: boolean;
}

export interface GoalscorerInfo {
  scorerName: string;
  assisterName?: string | null;
  minute: number;
  isPenalty?: boolean;
  isOwnGoal?: boolean;
  teamId: string;
}

export interface InjuryReport {
  playerName: string;
  teamName: string;
  diagnosis: string;
  recoveryTimeline: string;
  severity: 'Minor' | 'Moderate' | 'Severe';
}

export interface PlayerMatchResult {
  playerId: string;
  name: string;
  position: Position;
  number: number;
  teamId: string;
  teamName: string;
  rating: number; // 1.0 to 10.0
  remainingStamina: number; // 0 to 100%
  minutesPlayed: number;
  goals: number;
  assists: number;
  yellowCards: number;
  redCard: boolean;
  injury?: InjuryReport | null;
}

export interface MatchStats {
  possessionA: number;
  possessionB: number;
  shotsA: number;
  shotsB: number;
  shotsOnTargetA: number;
  shotsOnTargetB: number;
  xgA: number;
  xgB: number;
  passesA: number;
  passesB: number;
  passAccuracyA: number;
  passAccuracyB: number;
  foulsA: number;
  foulsB: number;
  yellowCardsA: number;
  yellowCardsB: number;
  redCardsA: number;
  redCardsB: number;
  cornersA: number;
  cornersB: number;
  offsidesA: number;
  offsidesB: number;
}

export interface ManOfTheMatch {
  playerName: string;
  teamName: string;
  rating: number;
  summary: string;
}

export interface SimulationOutput {
  teamAName: string;
  teamBName: string;
  scoreA: number;
  scoreB: number;
  goalscorers: GoalscorerInfo[];
  stats: MatchStats;
  playerResultsA: PlayerMatchResult[];
  playerResultsB: PlayerMatchResult[];
  manOfTheMatch: ManOfTheMatch;
  medicalReport: string[];
  rawFormattedText: string;
  simulatedAt: number;
  teamATacticsSummary?: string;
  teamBTacticsSummary?: string;
  teamATacticsRaw?: string;
  teamBTacticsRaw?: string;
}
