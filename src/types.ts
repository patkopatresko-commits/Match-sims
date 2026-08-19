export type SportType = 'football' | 'basketball' | 'tennis' | 'esports' | 'custom';

export type TacticType = 
  | 'All-Out Attack'
  | 'High Press & Counter'
  | 'Tiki-Taka Possession'
  | 'Balanced Control'
  | 'Park the Bus'
  | 'Fast Break & Perimeter'
  | 'Inside Paint Domination'
  | 'Serve & Volley'
  | 'Baseline Grinding'
  | 'Aggressive Rush'
  | 'Tactical Retake'
  | 'Wild Chaos';

export interface Player {
  id: string;
  name: string;
  number: number;
  position: string; // 'FW' | 'MF' | 'DF' | 'GK' | 'PG' | 'SG' | 'SF' | 'PF' | 'C' | 'Duelist' | 'IGL'
  rating: number; // 50 - 99
  stamina?: number;
  goalsScored?: number;
  assists?: number;
  points?: number;
  rebounds?: number;
  cards?: 'yellow' | 'red' | null;
  isCaptain?: boolean;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  sport: SportType;
  primaryColor: string;
  secondaryColor: string;
  textColor?: string;
  badgeEmoji: string;
  country?: string;
  league?: string;
  overallRating: number; // 50 - 99
  attackRating: number;
  defenseRating: number;
  midfieldRating?: number; // or pace / skill / stamina
  goalkeeperRating?: number;
  form: number; // 1 to 10
  aggression: 'Passive' | 'Balanced' | 'Aggressive' | 'Relentless';
  defaultTactic: TacticType;
  formation?: string; // '4-3-3', '4-4-2', '3-5-2', 'Small Ball', etc.
  players: Player[];
  isCustom?: boolean;
}

export interface MatchEvent {
  id: string;
  minute: number; // 1 to 90+ (or basketball minute 1-48, tennis game/set, esports round)
  phase?: string; // '1st Half', '2nd Half', 'Q1', 'Set 1', 'Round 12', 'Extra Time', 'Penalties'
  type: 
    | 'goal' 
    | 'point' 
    | 'three_pointer' 
    | 'dunk'
    | 'ace' 
    | 'break_point'
    | 'clutch_kill'
    | 'save' 
    | 'miss' 
    | 'post'
    | 'card_yellow' 
    | 'card_red' 
    | 'foul' 
    | 'penalty' 
    | 'penalty_scored' 
    | 'penalty_missed' 
    | 'injury' 
    | 'substitution' 
    | 'var_decision' 
    | 'commentary' 
    | 'momentum_shift'
    | 'timeout';
  teamId: string;
  player?: string;
  assistPlayer?: string;
  description: string;
  scoreSnapshot: [number, number];
  isHighlight: boolean;
  fieldCoordinates?: { x: number; y: number }; // Percentage 0-100 on field/court
}

export interface MatchStats {
  possession: [number, number]; // Percentages [52, 48]
  shots: [number, number];
  shotsOnTarget: [number, number];
  xG: [number, number]; // Expected goals
  fouls: [number, number];
  corners: [number, number];
  yellowCards: [number, number];
  redCards: [number, number];
  passesCompleted: [number, number];
  passAccuracy: [number, number];
  saves: [number, number];
  fastBreakPoints?: [number, number];
  threePointersMade?: [number, number];
  acesCount?: [number, number];
  breakPointsConverted?: [number, number];
  momentumHistory: number[]; // Array of -100 to 100 values across match progression
}

export interface PenaltyShootout {
  scoreA: number;
  scoreB: number;
  rounds: {
    roundNumber: number;
    teamATaker: string;
    teamAScored: boolean;
    teamBTaker: string;
    teamBScored: boolean;
  }[];
  winnerId: string;
}

export interface MatchResult {
  id: string;
  simulatedAt: number;
  sport: SportType;
  teamA: Team;
  teamB: Team;
  scoreA: number;
  scoreB: number;
  tacticA: TacticType;
  tacticB: TacticType;
  winnerId: string | 'draw';
  events: MatchEvent[];
  stats: MatchStats;
  wentToExtraTime: boolean;
  wentToPenalties: boolean;
  penaltyShootout?: PenaltyShootout;
  manOfTheMatch: {
    name: string;
    teamId: string;
    teamName: string;
    rating: number; // 6.0 - 10.0
    reason: string;
  };
  weather: 'Clear' | 'Rain' | 'Snow' | 'Windy' | 'Indoor Roof';
  venue: string;
  crowdAttendance: number;
}

export interface TournamentMatch {
  id: string;
  roundIndex: number;
  matchIndex: number;
  teamA?: Team;
  teamB?: Team;
  result?: MatchResult;
  winner?: Team;
}

export interface Tournament {
  id: string;
  name: string;
  sport: SportType;
  size: 4 | 8 | 16;
  teams: Team[];
  rounds: {
    roundName: string;
    matches: TournamentMatch[];
  }[];
  currentRoundIndex: number;
  isFinished: boolean;
  champion?: Team;
  runnerUp?: Team;
  createdAt: number;
}

export interface SimSettings {
  speed: 'instant' | '10x' | '5x' | '2x' | '1x';
  weather: 'Clear' | 'Rain' | 'Snow' | 'Windy' | 'Indoor Roof';
  stadiumVenue: 'Home/Away' | 'Neutral Venue' | 'Megastadium';
  allowExtraTime: boolean;
  allowPenalties: boolean;
  randomFactor: number; // 0 (strictly stats) to 100 (pure unpredictability)
  soundEffects: boolean;
}
