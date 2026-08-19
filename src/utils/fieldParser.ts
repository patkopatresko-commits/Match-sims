import { 
  FootballTeamInput, 
  FootballPlayer, 
  MatchVariables, 
  Mentality, 
  Tempo, 
  Pressing, 
  Tackling, 
  Position 
} from '../types';

export interface TeamSetupInput {
  name: string;
  playersText: string;
  tacticalInstructions: string;
}

export interface MatchSetupInput {
  teamA: TeamSetupInput;
  teamB: TeamSetupInput;
  matchVars: MatchVariables;
}

export interface ValidationErrors {
  teamAName?: string;
  teamAPlayers?: string;
  teamBName?: string;
  teamBPlayers?: string;
  general?: string;
}

/**
 * Extracts non-empty lines from the players textarea.
 * Splits by newline, trims each line, removes empty lines, and counts only non-empty entries.
 */
export function extractPlayerLines(playersText: string): string[] {
  if (!playersText) return [];
  return playersText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
}

/**
 * Strictly sanitizes a player name so that it contains ONLY the player's clean first and last name.
 * Removes positions, roles, tactical descriptions, instructions, ratings, form, parenthesized/bracketed text, and extra words.
 */
export function sanitizePlayerNameOnly(rawName: string): string {
  if (!rawName) return '';
  let str = rawName.trim();

  // 1. Remove all enclosed parenthetical, bracketed, or braced substrings:
  // e.g. "(Inverted Wing-Back - Attack)", "(GK)", "[Wing-Back - Support]", "{Poacher}", "<...>"
  str = str.replace(/\([^)]*\)/g, ' ');
  str = str.replace(/\[[^\]]*\]/g, ' ');
  str = str.replace(/\{[^}]*\}/g, ' ');
  str = str.replace(/<[^>]*>/g, ' ');

  // 2. Strip leading index numbers, bullets, hashtags, shirt number markers:
  // e.g. "1. ", "1) ", "#1 ", "No. 1 ", "1 - ", "• ", "- ", "* "
  str = str.replace(/^[•\-\*\>#\s]+/g, '');
  str = str.replace(/^(?:no\.?|#)?\s*\d{1,2}\s*[\.\-\):]?\s+/i, '');
  str = str.replace(/^[•\-\*\>#\s]+/g, '');

  // 3. Strip leading position / role indicators:
  // e.g. "GK:", "RB:", "CB:", "DM:", "CM:", "AMR:", "AMC:", "AML:", "ST:", "RCB:", "LCB:", "LW:", "RW:", "GKP", "RWB", "LWB", "CDM", "CAM", "CF", "Pos:", "Position:"
  const leadingPositionRegex = /^(?:GK|GKP|RB|LB|CB|LCB|RCB|NCB|BPD|CD|FB|WB|IWB|IFB|CWB|DM|CDM|LDM|RDM|BWM|DLP|VOL|CM|LCM|RCM|BBM|MEZ|CAR|AP|AM|CAM|RAM|LAM|SS|AMR|AML|AMC|RW|LW|RWF|LWF|IW|IF|WT|RWB|LWB|CF|ST|AF|PF|TF|TM|DLF|SK|Pos|Position|Goalkeeper|Keeper|Goalie|Defender|Midfielder|Forward|Striker|Winger|Attacker)\s*[:\-\–\—\.\s]\s*/i;
  
  let prev = '';
  while (prev !== str) {
    prev = str;
    str = str.replace(leadingPositionRegex, '').trim();
    str = str.replace(/^[•\-\*\>#\s:,|/]+/g, '').trim();
  }

  // 4. If there is a trailing delimiter (dash with spaces, colon, pipe, slash, comma) separating name from role / tactics:
  // e.g. "Matthijs de Ligt - Ball Playing Defender - Defend"
  // e.g. "Lisandro Martínez, Stopper"
  // e.g. "Patrick Dorgu | Complete Wing-Back"
  // e.g. "Matheus Cunha / Inside Forward"
  // e.g. "Senne Lammens: Sweeper Keeper"
  const delimiterMatch = str.match(/^([^\-\–\—\|/:\,]+?)(?:\s+[-–—|/]\s*|[,:|/]\s+)(.*)$/);
  if (delimiterMatch && delimiterMatch[1].trim().length > 0) {
    str = delimiterMatch[1].trim();
  }

  // 5. Strip any ratings, form, or shirt number tags:
  // e.g. "88 OVR", "88 rating", "7.8 form", "88", "7.8", "#10"
  str = str.replace(/\b[4-9]\d\s*(?:ovr|rating)?\b/gi, ' ');
  str = str.replace(/\b[1-9]\.\d\s*(?:form)?\b/gi, ' ');
  str = str.replace(/#\d{1,2}\b/g, ' ');

  // 6. Strip any tactical roles / position keywords that might be trailing without delimiters:
  const tacticalKeywords = [
    // Multi-word roles
    'Sweeper Keeper', 'Ball Playing Defender', 'Central Defender', 'No Nonsense Centre Back', 'No-Nonsense Centre-Back',
    'Inverted Wing Back', 'Inverted Wing-Back', 'Inverted Full Back', 'Inverted Full-Back', 'Complete Wing Back', 'Complete Wing-Back',
    'Wing Back', 'Wing-Back', 'Full Back', 'Full-Back', 'Centre Back', 'Centre-Back', 'Center Back', 'Center-Back',
    'Deep Lying Playmaker', 'Deep-Lying Playmaker', 'Ball Winning Midfielder', 'Ball-Winning Midfielder',
    'Box to Box Midfielder', 'Box to Box', 'Box-to-Box Midfielder', 'Box-to-Box', 'Central Midfielder', 'Defensive Midfielder', 'Attacking Midfielder',
    'Advanced Playmaker', 'Shadow Striker', 'Inside Forward', 'Inverted Winger', 'Wide Playmaker', 'Wide Target Forward', 'Wide Midfielder',
    'Target Forward', 'Target Man', 'Complete Forward', 'Advanced Forward', 'Pressing Forward', 'False Nine', 'False 9',
    'Segundo Volante', 'Anchor Man', 'Half Back',
    // Single-word roles / instructions
    'Mezzala', 'Carrilero', 'Raumdeuter', 'Poacher', 'Trequartista', 'Regista', 'Enganche',
    'Goalkeeper', 'Defender', 'Midfielder', 'Forward', 'Striker', 'Keeper', 'Goalie', 'Captain', 'Sub', 'Substitute', 'Starter',
    'Stopper', 'Cover', 'Defend', 'Support', 'Attack', 'Roam', 'Hold', 'Stay',
    // Positions
    'GK', 'GKP', 'RB', 'LB', 'CB', 'LCB', 'RCB', 'NCB', 'BPD', 'CD', 'FB', 'WB', 'IWB', 'IFB', 'CWB',
    'DM', 'CDM', 'LDM', 'RDM', 'BWM', 'DLP', 'VOL', 'CM', 'LCM', 'RCM', 'BBM', 'MEZ', 'CAR', 'AP',
    'AM', 'CAM', 'RAM', 'LAM', 'SS', 'AMR', 'AML', 'AMC', 'RW', 'LW', 'RWF', 'LWF', 'IW', 'IF', 'WT',
    'RWB', 'LWB', 'CF', 'ST', 'AF', 'PF', 'TF', 'TM', 'DLF', 'SK'
  ];

  for (const kw of tacticalKeywords) {
    const regex = new RegExp(`\\b${kw.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}\\b`, 'gi');
    str = str.replace(regex, ' ');
  }

  // 7. Strip verbs like "scored", "assisted", "pen", "penalty", "goal"
  str = str.replace(/\b(?:scored|scoring|assisted|assisting|assist|assists|goal|goals|pen|penalty|sub|substitute)\b/gi, ' ');

  // 8. Clean up non-name characters: keep letters, accents (\p{L}\p{M}), spaces, hyphens, and apostrophes
  str = str.replace(/[^\p{L}\p{M}\s\-'.]/gu, ' ');

  // 9. Normalize whitespace and clean edges
  str = str.replace(/\s+/g, ' ').trim();
  str = str.replace(/^[\s\-'.]+|[\s\-'.]+$/g, '').trim();

  return str;
}

/**
 * Parse an individual player line into a structured FootballPlayer object.
 * Extracts shirt number, position, overall rating, form, and player name.
 */
export function parseSinglePlayerLine(
  rawLine: string, 
  index: number, 
  teamPrefix: string
): FootballPlayer {
  let text = rawLine.trim();

  // 1. Shirt Number extraction (#7, 7., 7), No. 7, 7 -)
  let shirtNumber = index + 1;
  const numMatch = text.match(/^(?:no\.?|#)?\s*(\d{1,2})\s*[\.\-\):]?\s+/i) || text.match(/#(\d{1,2})\b/);
  if (numMatch) {
    const parsedNum = parseInt(numMatch[1], 10);
    if (parsedNum > 0 && parsedNum <= 99) {
      shirtNumber = parsedNum;
    }
    text = text.replace(/^(?:no\.?|#)?\s*\d{1,2}\s*[\.\-\):]?\s+/i, '').trim();
  }

  // 2. Position extraction
  let position: Position;
  if (/\b(?:GK|GKP|SK|goalkeeper|keeper|goalie|portiere|portero|torwart)\b/i.test(text)) {
    position = 'GK';
  } else if (/\b(?:DF|CB|LB|RB|RWB|LWB|RCB|LCB|NCB|BPD|CD|FB|WB|IWB|IFB|CWB|defender|back|centre-back|center-back|centerback|fullback|difensore|defensa)\b/i.test(text)) {
    position = 'DF';
  } else if (/\b(?:FW|ST|CF|RW|LW|AMR|AML|RWF|LWF|IW|IF|WT|AF|PF|TF|TM|DLF|SS|striker|forward|winger|attacker|poacher|delantero|attaccante|sturmer)\b/i.test(text)) {
    position = 'FW';
  } else if (/\b(?:MF|CM|DM|CAM|CDM|RM|LM|LDM|RDM|LCM|RCM|RAM|LAM|AMC|BWM|DLP|VOL|BBM|MEZ|CAR|AP|midfielder|midfield|centrocampista|mittelfeld)\b/i.test(text)) {
    position = 'MF';
  } else {
    // Default by index sequence (1 GK, 4 DF, 3 MF, 3 FW)
    if (index === 0) position = 'GK';
    else if (index >= 1 && index <= 4) position = 'DF';
    else if (index >= 5 && index <= 7) position = 'MF';
    else position = 'FW';
  }

  // 3. Overall Rating extraction
  let overall = 84;
  const ovrMatch = text.match(/\b([4-9]\d)\s*(?:ovr|rating)?\b/i);
  if (ovrMatch) {
    overall = parseInt(ovrMatch[1], 10);
  }

  // 4. Form extraction
  let form = 7.5;
  const formMatch = text.match(/\b([1-9]\.\d)\s*(?:form)?\b/i);
  if (formMatch) {
    form = parseFloat(formMatch[1]);
  }

  // 5. Clean Name extraction - Strictly First and Last Name Only
  let cleanName = sanitizePlayerNameOnly(text);

  if (!cleanName || cleanName.length === 0) {
    cleanName = `Player ${index + 1}`;
  }

  return {
    id: `${teamPrefix}-p-${index + 1}-${Math.random().toString(36).substring(2, 6)}`,
    name: cleanName,
    number: shirtNumber,
    position,
    overall,
    form,
    startingStamina: 100,
  };
}

/**
 * Parses tactical instructions textarea into structured tactical parameters
 */
export function parseTacticalInstructions(text: string) {
  const clean = text || '';
  const lower = clean.toLowerCase();
  
  let formation = '4-3-3';
  const formMatch = clean.match(/\b(\d\-\d\-\d(?:\-\d)?)\b/);
  if (formMatch) {
    formation = formMatch[1];
  }

  let mentality: Mentality = 'Balanced';
  if (lower.includes('all-out attack') || lower.includes('all out attack')) {
    mentality = 'All-Out Attack';
  } else if (lower.includes('park the bus') || lower.includes('ultra defensive')) {
    mentality = 'Ultra Defensive';
  } else if (lower.includes('attacking') || lower.includes('offensive')) {
    mentality = 'Attacking';
  } else if (lower.includes('defensive') || lower.includes('counter-attack') || lower.includes('counter attack')) {
    mentality = 'Defensive';
  }

  let pressing: Pressing = 'Mid Block';
  if (lower.includes('high press') || lower.includes('gegenpress') || lower.includes('counter-press')) {
    pressing = 'High Press & Counter-Press';
  } else if (lower.includes('low block') || lower.includes('drop deep')) {
    pressing = 'Low Block';
  }

  let tackling: Tackling = 'Normal';
  if (lower.includes('aggressive tackling') || lower.includes('hard tackle') || lower.includes('physical') || lower.includes('aggressive')) {
    tackling = 'Aggressive';
  } else if (lower.includes('cautious') || lower.includes('stay on feet')) {
    tackling = 'Cautious';
  }

  let tempo: Tempo = 'Standard';
  if (lower.includes('high tempo') || lower.includes('fast pace') || lower.includes('direct')) {
    tempo = 'Direct & High Tempo';
  } else if (lower.includes('slow') || lower.includes('patient') || lower.includes('tiki-taka') || lower.includes('possession')) {
    tempo = 'Slow & Patient';
  }

  return {
    formation,
    mentality,
    tempo,
    pressing,
    tackling,
    customNotes: clean.trim() || undefined,
  };
}

/**
 * Validate all fields strictly and separately:
 * - Team name must be non-empty
 * - Players must be exactly 11 lines
 * - Tactical instructions can be any text
 */
export function validateMatchSetup(setup: MatchSetupInput): { 
  isValid: boolean; 
  errors: ValidationErrors; 
} {
  const errors: ValidationErrors = {};

  // Team A Name Validation
  const teamANameTrimmed = (setup.teamA.name || '').trim();
  if (teamANameTrimmed.length === 0) {
    errors.teamAName = 'Team 1 name cannot be empty. Please enter a team name.';
  }

  // Team A Players Validation (Must be exactly 11 non-empty lines)
  const linesA = extractPlayerLines(setup.teamA.playersText);
  if (linesA.length !== 11) {
    errors.teamAPlayers = `Team 1 requires exactly 11 players. Currently has ${linesA.length} ${linesA.length === 1 ? 'line' : 'lines'}.`;
  }

  // Team B Name Validation
  const teamBNameTrimmed = (setup.teamB.name || '').trim();
  if (teamBNameTrimmed.length === 0) {
    errors.teamBName = 'Team 2 name cannot be empty. Please enter a team name.';
  }

  // Team B Players Validation (Must be exactly 11 non-empty lines)
  const linesB = extractPlayerLines(setup.teamB.playersText);
  if (linesB.length !== 11) {
    errors.teamBPlayers = `Team 2 requires exactly 11 players. Currently has ${linesB.length} ${linesB.length === 1 ? 'line' : 'lines'}.`;
  }

  const isValid = Object.keys(errors).length === 0;
  return { isValid, errors };
}

/**
 * Converts validated separated fields into FootballTeamInput objects
 */
export function buildTeamsFromSetup(setup: MatchSetupInput): {
  teamA: FootballTeamInput;
  teamB: FootballTeamInput;
} {
  const linesA = extractPlayerLines(setup.teamA.playersText);
  const linesB = extractPlayerLines(setup.teamB.playersText);

  const playersA: FootballPlayer[] = linesA.map((line, idx) => 
    parseSinglePlayerLine(line, idx, 'team-0')
  );

  const playersB: FootballPlayer[] = linesB.map((line, idx) => 
    parseSinglePlayerLine(line, idx, 'team-1')
  );

  const tacticsA = parseTacticalInstructions(setup.teamA.tacticalInstructions);
  const tacticsB = parseTacticalInstructions(setup.teamB.tacticalInstructions);

  const teamA: FootballTeamInput = {
    id: 'team-0',
    name: setup.teamA.name.trim(),
    badgeEmoji: '🔵',
    startingXI: playersA,
    bench: [],
    tactics: tacticsA,
  };

  const teamB: FootballTeamInput = {
    id: 'team-1',
    name: setup.teamB.name.trim(),
    badgeEmoji: '🔴',
    startingXI: playersB,
    bench: [],
    tactics: tacticsB,
  };

  return { teamA, teamB };
}
