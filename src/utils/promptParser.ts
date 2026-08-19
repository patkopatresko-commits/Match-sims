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

export interface ParsedPromptResult {
  teamA: FootballTeamInput;
  teamB: FootballTeamInput;
  matchVars: MatchVariables;
  rawParsedSummary: string;
}

// Comprehensive list of reserved section keywords that are NEVER team names or players
const RESERVED_PREFIXES = [
  'tactical instructions',
  'tactical instruction',
  'tactics',
  'tactic',
  'instructions',
  'instruction',
  'game plan',
  'strategy',
  'tactical setup',
  'setup',
  'formation',
  'mentality',
  'tempo',
  'pressing',
  'tackling',
  'style',
  'lineup',
  'lineups',
  'starting xi',
  'starting 11',
  'starting lineup',
  'players',
  'squad',
  'starters',
  'team sheet',
  'first 11',
  'first xi',
  'bench',
  'substitutes',
  'subs',
  'venue',
  'weather',
  'referee',
  'stadium',
  'extra time',
  'pitch',
  'conditions',
  'goalkeepers',
  'goalkeeper',
  'gk',
  'defenders',
  'defender',
  'defense',
  'df',
  'midfielders',
  'midfielder',
  'midfield',
  'mf',
  'forwards',
  'forward',
  'attackers',
  'attacker',
  'attack',
  'fw',
  'strikers',
  'striker',
];

function isReservedHeaderLine(line: string): boolean {
  const clean = line.toLowerCase().trim().replace(/[:\-]$/, '').trim();
  return RESERVED_PREFIXES.some(prefix => clean === prefix || clean.startsWith(prefix + ':') || clean.startsWith(prefix + ' -') || clean.startsWith(prefix + ' '));
}

function isPureTacticalOrConditionLine(line: string): boolean {
  const l = line.toLowerCase().trim();
  
  // Explicit header matches
  if (/^(?:tactical\s*instructions?|tactics?|instructions?|game\s*plan|strategy|formation|mentality|tempo|pressing|tackling|style|venue|weather|referee|stadium|extra\s*time|pitch|conditions)\s*[:\-]/i.test(l)) {
    return true;
  }
  
  // Tactical keywords when no player numbering is present
  const hasPlayerNumber = /^(?:no\.?|#)?\s*\d{1,2}\s*[\.\-\):]?\s+/i.test(l);
  if (!hasPlayerNumber) {
    if (l.startsWith('formation:') || l.startsWith('tactics:') || l.startsWith('tactical') || l.startsWith('mentality:') || l.startsWith('tempo:') || l.startsWith('pressing:') || l.startsWith('tackling:') || l.startsWith('venue:') || l.startsWith('weather:') || l.startsWith('referee:')) {
      return true;
    }
  }
  return false;
}

/**
 * Clean and parse a single player string token.
 * Strictly ignores non-player lines (tactics, headers, empty text).
 */
function parsePlayerEntry(
  raw: string, 
  fallbackNumber: number, 
  teamIndex: number,
  contextPosition?: Position
): FootballPlayer | null {
  let text = raw.trim();
  if (!text || text.length < 1) return null;

  // If the line is clearly a header or tactical declaration, it is NOT a player
  if (isPureTacticalOrConditionLine(text)) return null;
  if (/^(?:lineup|starting\s*xi|starting\s*11|players|squad|starters|bench|substitutes|goalkeepers?|defenders?|midfielders?|forwards?|attackers?)\s*[:\-]?$/i.test(text)) {
    return null;
  }

  // 1. Extract Shirt Number if present (e.g. "1.", "1)", "#10", "No. 7", "14 -", "1:", "1 ")
  let shirtNumber = fallbackNumber;
  const numMatch = text.match(/^(?:no\.?|#)?\s*(\d{1,2})\s*[\.\-\):]?\s+/i) || text.match(/#(\d{1,2})\b/);
  if (numMatch) {
    const n = parseInt(numMatch[1], 10);
    if (n > 0 && n <= 99) {
      shirtNumber = n;
    }
    // Remove the leading number prefix from text
    text = text.replace(/^(?:no\.?|#)?\s*\d{1,2}\s*[\.\-\):]?\s+/i, '').trim();
  }

  // 2. Extract Position if stated in brackets, parentheses, or suffix
  let position: Position = contextPosition || 'MF';
  if (/\b(?:GK|goalkeeper|keeper|goalie|portiere|portero|torwart)\b/i.test(text)) {
    position = 'GK';
  } else if (/\b(?:DF|CB|LB|RB|RWB|LWB|defender|back|centre-back|centerback|fullback|difensore|defensa)\b/i.test(text)) {
    position = 'DF';
  } else if (/\b(?:FW|ST|CF|RW|LW|striker|forward|winger|attacker|delantero|attaccante|sturmer)\b/i.test(text)) {
    position = 'FW';
  } else if (/\b(?:MF|CM|DM|CAM|CDM|RM|LM|midfielder|midfield|centrocampista|mittelfeld)\b/i.test(text)) {
    position = 'MF';
  } else if (!contextPosition) {
    if (fallbackNumber === 1) position = 'GK';
    else if (fallbackNumber >= 2 && fallbackNumber <= 5) position = 'DF';
    else if (fallbackNumber >= 6 && fallbackNumber <= 8) position = 'MF';
    else position = 'FW';
  }

  // 3. Extract Overall Rating if provided (e.g. "88 OVR", "91", "(85)", "rating: 86")
  let overall = 84;
  const ovrMatch = text.match(/\b([4-9]\d)\s*(?:ovr|rating)?\b/i);
  if (ovrMatch) {
    overall = parseInt(ovrMatch[1], 10);
  }

  // 4. Extract Form if provided (e.g. "7.8 form", "form: 8.1", "8.5")
  let form = 7.5;
  const formMatch = text.match(/\b([1-9]\.\d)\s*(?:form)?\b/i);
  if (formMatch) {
    form = parseFloat(formMatch[1]);
  }

  // 5. Clean Name
  let cleanName = text
    .replace(/\((?:GK|DF|MF|FW|CB|LB|RB|RWB|LWB|CM|DM|CAM|CDM|RM|LM|ST|CF|RW|LW|goalkeeper|defender|midfielder|forward|striker)\)/gi, '')
    .replace(/\[(?:GK|DF|MF|FW|CB|LB|RB|RWB|LWB|CM|DM|CAM|CDM|RM|LM|ST|CF|RW|LW|goalkeeper|defender|midfielder|forward|striker)\]/gi, '')
    .replace(/\b(?:GK|DF|MF|FW|CB|LB|RB|CM|DM|CAM|CDM|RM|LM|ST|CF|RW|LW)\b/gi, '')
    .replace(/\b([4-9]\d)\s*(?:ovr|rating)\b/gi, '')
    .replace(/\b([1-9]\.\d)\s*(?:form)\b/gi, '')
    .replace(/#\d{1,2}\b/g, '')
    .replace(/[\(\)\[\]\{\}]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  // If cleaning stripped everything, recover
  if (!cleanName || cleanName.length < 1) {
    cleanName = raw.replace(/^\s*(?:no\.?|#)?\s*\d{1,2}\s*[\.\-\):]?\s*/i, '').trim();
  }
  if (!cleanName || cleanName.length < 1 || cleanName.match(/^(?:tactic|tactics|formation|mentality|tempo|pressing|tackling|venue|weather|referee)$/i)) {
    return null;
  }

  return {
    id: `p-${teamIndex}-${fallbackNumber}-${Math.random().toString(36).substring(2, 7)}`,
    name: cleanName,
    number: shirtNumber,
    position,
    overall,
    form,
    startingStamina: 100,
  };
}

/**
 * Universal, Robust Match Prompt Parser:
 * - Separates Team A and Team B accurately
 * - Parses tactical instructions without confusing them with team names
 * - Counts the exact number of players provided
 */
export function parseMatchPrompt(promptText: string): ParsedPromptResult {
  const cleanText = (promptText || '').trim();
  const lower = cleanText.toLowerCase();

  // Match Variables Extraction
  let venue: 'Neutral' | 'Team A Home' | 'Team B Home' = 'Neutral';
  if (lower.includes('team a home') || lower.includes('home advantage for team a') || lower.includes('home: team a') || lower.includes('home advantage')) {
    venue = 'Team A Home';
  } else if (lower.includes('team b home') || lower.includes('home advantage for team b') || lower.includes('home: team b') || lower.includes('away advantage')) {
    venue = 'Team B Home';
  }

  let weather: 'Clear / Mild' | 'Heavy Rain (Slick Pitch)' | 'Extreme Heat (High Fatigue)' | 'Snow / Freezing' = 'Clear / Mild';
  if (lower.includes('rain') || lower.includes('wet') || lower.includes('storm') || lower.includes('slick')) {
    weather = 'Heavy Rain (Slick Pitch)';
  } else if (lower.includes('heat') || lower.includes('hot') || lower.includes('humid') || lower.includes('35c') || lower.includes('summer')) {
    weather = 'Extreme Heat (High Fatigue)';
  } else if (lower.includes('snow') || lower.includes('freezing') || lower.includes('cold') || lower.includes('ice') || lower.includes('blizzard')) {
    weather = 'Snow / Freezing';
  }

  let refereeStrictness: 'Lenient' | 'Standard' | 'Strict' = 'Standard';
  if (lower.includes('strict ref') || lower.includes('harsh ref') || lower.includes('referee: strict') || lower.includes('red card ref')) {
    refereeStrictness = 'Strict';
  } else if (lower.includes('lenient ref') || lower.includes('soft ref') || lower.includes('referee: lenient') || lower.includes('allows physical')) {
    refereeStrictness = 'Lenient';
  }

  const extraTime = lower.includes('extra time') || lower.includes('120 min') || lower.includes('et: true') || lower.includes('knockout');

  // Parse Team A and Team B Blocks
  let teamAName = 'Team A';
  let teamBName = 'Team B';
  let formationA = '4-3-3';
  let formationB = '4-3-3';
  let mentalityA: Mentality = 'Balanced';
  let mentalityB: Mentality = 'Balanced';
  let pressingA: Pressing = 'Mid Block';
  let pressingB: Pressing = 'Mid Block';
  let tacklingA: Tackling = 'Normal';
  let tacklingB: Tackling = 'Normal';
  let tempoA: Tempo = 'Standard';
  let tempoB: Tempo = 'Standard';

  const playersA: FootballPlayer[] = [];
  const playersB: FootballPlayer[] = [];

  let currentTeamIdx: 0 | 1 = 0;
  let currentCategoryPosition: Position | undefined = undefined;

  const rawLines = cleanText.split('\n');

  // Check top line for "Team X vs Team Y"
  if (rawLines.length > 0) {
    const firstLine = rawLines[0].trim();
    const vsMatch = firstLine.match(/^([^\n\r,]+?)\s+(?:vs\.?|versus|v)\s+([^\n\r,]+)$/i);
    if (vsMatch && !vsMatch[1].toLowerCase().includes('lineup') && !vsMatch[2].toLowerCase().includes('lineup')) {
      teamAName = vsMatch[1].replace(/^team\s*[a|1]\s*[:\-]?\s*/i, '').trim();
      teamBName = vsMatch[2].replace(/^team\s*[b|2]\s*[:\-]?\s*/i, '').trim();
    }
  }

  for (let i = 0; i < rawLines.length; i++) {
    const rawLine = rawLines[i];
    const line = rawLine.trim();
    if (!line) {
      currentCategoryPosition = undefined;
      continue;
    }

    const lineLower = line.toLowerCase();

    // 1. Skip Pure Match Variables
    if (/^(?:venue|weather|referee|stadium|pitch|extra\s*time)\s*[:\-]/i.test(line)) {
      continue;
    }

    // 2. Detect Team B Header (e.g. "Team B: Real Madrid", "Team 2: Chelsea", "Away Team: Liverpool", "Opponent: PSG")
    const isExplicitTeamBHeader = 
      /^(?:team\s*(?:b|2|two|away)|away\s*team|second\s*team|opponent)\s*[:\-]?\s*(.*)$/i.test(line) ||
      (currentTeamIdx === 0 && playersA.length >= 1 && /^(?:vs\.?|versus|---|===|\*\*\*)$/i.test(line));

    if (isExplicitTeamBHeader) {
      currentTeamIdx = 1;
      currentCategoryPosition = undefined;
      const matchHeader = line.match(/^(?:team\s*(?:b|2|two|away)|away\s*team|second\s*team|opponent)\s*[:\-]?\s*(.*)$/i);
      if (matchHeader && matchHeader[1] && matchHeader[1].trim().length > 1) {
        const potentialName = matchHeader[1].trim();
        if (!isReservedHeaderLine(potentialName)) {
          teamBName = potentialName;
        }
      }
      continue;
    }

    // 3. Detect Team A Header (e.g. "Team A: Arsenal", "Team 1: Barcelona", "Home Team: Bayern")
    const isExplicitTeamAHeader = /^(?:team\s*(?:a|1|one|home)|home\s*team|first\s*team)\s*[:\-]?\s*(.*)$/i.test(line);
    if (isExplicitTeamAHeader) {
      currentTeamIdx = 0;
      currentCategoryPosition = undefined;
      const matchHeader = line.match(/^(?:team\s*(?:a|1|one|home)|home\s*team|first\s*team)\s*[:\-]?\s*(.*)$/i);
      if (matchHeader && matchHeader[1] && matchHeader[1].trim().length > 1) {
        const potentialName = matchHeader[1].trim();
        if (!isReservedHeaderLine(potentialName)) {
          teamAName = potentialName;
        }
      }
      continue;
    }

    // 4. Standalone Team Name Header (e.g. "Arsenal:" or "Chelsea:" or "Real Madrid:")
    // MUST NEVER match reserved keywords like "Tactical Instructions:", "Tactics:", "Formation:", "Lineup:", etc.
    const standaloneColonMatch = line.match(/^([a-zA-Z0-9\s\.\-]{2,35})\s*:\s*$/);
    if (standaloneColonMatch) {
      const headerTitle = standaloneColonMatch[1].trim();
      if (isReservedHeaderLine(headerTitle)) {
        // This is a tactical or lineup header (e.g. "Tactical Instructions:"), NOT a team name!
        // Just continue processing the rest of the file without changing teams
        continue;
      }

      // Valid custom team name header
      if (currentTeamIdx === 0 && playersA.length >= 1) {
        currentTeamIdx = 1;
        teamBName = headerTitle;
      } else if (currentTeamIdx === 0 && playersA.length === 0) {
        teamAName = headerTitle;
      } else {
        teamBName = headerTitle;
      }
      currentCategoryPosition = undefined;
      continue;
    }

    // 5. Check for Position Group Subheaders (e.g. "Goalkeepers:", "Defenders:", "Midfielders:", "Forwards:")
    if (/^(?:goalkeepers?|gk)\s*[:\-]?$/i.test(line)) {
      currentCategoryPosition = 'GK';
      continue;
    }
    if (/^(?:defenders?|backs?|defense|df|defence)\s*[:\-]?$/i.test(line)) {
      currentCategoryPosition = 'DF';
      continue;
    }
    if (/^(?:midfielders?|midfield|mids?|mf)\s*[:\-]?$/i.test(line)) {
      currentCategoryPosition = 'MF';
      continue;
    }
    if (/^(?:forwards?|attackers?|attack|strikers?|wingers?|fw)\s*[:\-]?$/i.test(line)) {
      currentCategoryPosition = 'FW';
      continue;
    }

    // 6. Check for Generic Section Headers (e.g. "Lineup:", "Starting XI:", "Players:", "Tactical Instructions:")
    if (/^(?:lineup|starting\s*xi|starting\s*11|starters|players|squad|team\s*sheet|tactical\s*instructions?|tactics?|instructions?|game\s*plan|strategy)\s*[:\-]?$/i.test(line)) {
      continue;
    }

    // 7. Check for Formations in Line (e.g. "Formation: 4-3-3" or "4-2-3-1" or "3-5-2")
    const formMatch = line.match(/\b(\d\-\d\-\d(?:\-\d)?)\b/);
    if (formMatch) {
      if (currentTeamIdx === 0) formationA = formMatch[1];
      else formationB = formMatch[1];
    }

    // 8. Tactical Directives Handling
    if (/^(?:tactical\s*instructions?|tactics?|instructions?|game\s*plan|strategy|formation|mentality|tempo|pressing|tackling|style)\s*[:\-]/i.test(line) ||
        lineLower.includes('tactic') || lineLower.includes('mentality') || lineLower.includes('press') || 
        lineLower.includes('tempo') || lineLower.includes('tackle') || lineLower.includes('block')) {
      
      // Mentality
      if (lineLower.includes('all-out attack') || lineLower.includes('all out attack')) {
        if (currentTeamIdx === 0) mentalityA = 'All-Out Attack'; else mentalityB = 'All-Out Attack';
      } else if (lineLower.includes('park the bus') || lineLower.includes('ultra defensive')) {
        if (currentTeamIdx === 0) mentalityA = 'Ultra Defensive'; else mentalityB = 'Ultra Defensive';
      } else if (lineLower.includes('attacking') || lineLower.includes('offensive')) {
        if (currentTeamIdx === 0) mentalityA = 'Attacking'; else mentalityB = 'Attacking';
      } else if (lineLower.includes('defensive') || lineLower.includes('counter-attack') || lineLower.includes('counter attack')) {
        if (currentTeamIdx === 0) mentalityA = 'Defensive'; else mentalityB = 'Defensive';
      }

      // Pressing
      if (lineLower.includes('high press') || lineLower.includes('gegenpress') || lineLower.includes('counter-press')) {
        if (currentTeamIdx === 0) pressingA = 'High Press & Counter-Press'; else pressingB = 'High Press & Counter-Press';
      } else if (lineLower.includes('low block') || lineLower.includes('drop deep')) {
        if (currentTeamIdx === 0) pressingA = 'Low Block'; else pressingB = 'Low Block';
      }

      // Tackling
      if (lineLower.includes('aggressive tackling') || lineLower.includes('hard tackle') || lineLower.includes('physical')) {
        if (currentTeamIdx === 0) tacklingA = 'Aggressive'; else tacklingB = 'Aggressive';
      } else if (lineLower.includes('cautious') || lineLower.includes('stay on feet')) {
        if (currentTeamIdx === 0) tacklingA = 'Cautious'; else tacklingB = 'Cautious';
      }

      // Tempo
      if (lineLower.includes('high tempo') || lineLower.includes('fast pace') || lineLower.includes('direct')) {
        if (currentTeamIdx === 0) tempoA = 'Direct & High Tempo'; else tempoB = 'Direct & High Tempo';
      } else if (lineLower.includes('slow') || lineLower.includes('patient') || lineLower.includes('tiki-taka') || lineLower.includes('possession')) {
        if (currentTeamIdx === 0) tempoA = 'Slow & Patient'; else tempoB = 'Slow & Patient';
      }

      // If the line is clearly a tactical declaration without player numbers, continue (do NOT parse as a player)
      if (isPureTacticalOrConditionLine(line)) {
        continue;
      }
    }

    // 9. Comma / Semicolon separated player list
    if (line.includes(',') && !line.startsWith('http')) {
      const cleanLineTokens = line.replace(/^(?:lineup|starting\s*xi|starting\s*11|starters|players|squad)\s*[:\-]\s*/i, '');
      const tokens = cleanLineTokens.split(/[,;]/).map(t => t.trim()).filter(Boolean);
      if (tokens.length >= 2) {
        tokens.forEach(tok => {
          const targetList = currentTeamIdx === 0 ? playersA : playersB;
          const p = parsePlayerEntry(tok, targetList.length + 1, currentTeamIdx, currentCategoryPosition);
          if (p) {
            targetList.push(p);
          }
        });
        continue;
      }
    }

    // 10. Check if a new numbered list starting at 1 begins (e.g. Team A has 5+ players and we hit "1. Courtois" or "#1 Courtois")
    // NOTE: MUST be digit 1 followed by non-digit delimiter to prevent matching 10, 11, 12, etc.
    const isStrictNumberOne = /^(?:no\.?|#)?\s*1(?!\d)\s*[\.\-\):]?\s+/i.test(line);
    if (currentTeamIdx === 0 && playersA.length >= 5 && isStrictNumberOne) {
      currentTeamIdx = 1;
      currentCategoryPosition = undefined;
    }

    // 11. Parse single player line
    const targetList = currentTeamIdx === 0 ? playersA : playersB;
    const p = parsePlayerEntry(line, targetList.length + 1, currentTeamIdx, currentCategoryPosition);
    if (p) {
      targetList.push(p);
    }
  }

  // Fallback defaults ONLY if a team is completely empty (0 players entered)
  if (playersA.length === 0) {
    playersA.push(
      { id: 'p-0-1', name: `${teamAName} Goalkeeper`, number: 1, position: 'GK', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-0-2', name: `${teamAName} Defender 1`, number: 2, position: 'DF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-0-3', name: `${teamAName} Defender 2`, number: 3, position: 'DF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-0-4', name: `${teamAName} Defender 3`, number: 4, position: 'DF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-0-5', name: `${teamAName} Defender 4`, number: 5, position: 'DF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-0-6', name: `${teamAName} Midfielder 1`, number: 6, position: 'MF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-0-7', name: `${teamAName} Midfielder 2`, number: 7, position: 'MF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-0-8', name: `${teamAName} Midfielder 3`, number: 8, position: 'MF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-0-9', name: `${teamAName} Forward 1`, number: 9, position: 'FW', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-0-10', name: `${teamAName} Forward 2`, number: 10, position: 'FW', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-0-11', name: `${teamAName} Forward 3`, number: 11, position: 'FW', overall: 84, form: 7.5, startingStamina: 100 }
    );
  }

  if (playersB.length === 0) {
    playersB.push(
      { id: 'p-1-1', name: `${teamBName} Goalkeeper`, number: 1, position: 'GK', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-1-2', name: `${teamBName} Defender 1`, number: 2, position: 'DF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-1-3', name: `${teamBName} Defender 2`, number: 3, position: 'DF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-1-4', name: `${teamBName} Defender 3`, number: 4, position: 'DF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-1-5', name: `${teamBName} Defender 4`, number: 5, position: 'DF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-1-6', name: `${teamBName} Midfielder 1`, number: 6, position: 'MF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-1-7', name: `${teamBName} Midfielder 2`, number: 7, position: 'MF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-1-8', name: `${teamBName} Midfielder 3`, number: 8, position: 'MF', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-1-9', name: `${teamBName} Forward 1`, number: 9, position: 'FW', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-1-10', name: `${teamBName} Forward 2`, number: 10, position: 'FW', overall: 84, form: 7.5, startingStamina: 100 },
      { id: 'p-1-11', name: `${teamBName} Forward 3`, number: 11, position: 'FW', overall: 84, form: 7.5, startingStamina: 100 }
    );
  }

  const teamA: FootballTeamInput = {
    id: 'team-0',
    name: teamAName,
    badgeEmoji: '🔵',
    startingXI: playersA,
    bench: [],
    tactics: {
      formation: formationA,
      mentality: mentalityA,
      tempo: tempoA,
      pressing: pressingA,
      tackling: tacklingA,
    }
  };

  const teamB: FootballTeamInput = {
    id: 'team-1',
    name: teamBName,
    badgeEmoji: '🔴',
    startingXI: playersB,
    bench: [],
    tactics: {
      formation: formationB,
      mentality: mentalityB,
      tempo: tempoB,
      pressing: pressingB,
      tackling: tacklingB,
    }
  };

  const summary = `Match: ${teamA.name} (${teamA.startingXI.length} players) vs ${teamB.name} (${teamB.startingXI.length} players)`;

  return {
    teamA,
    teamB,
    matchVars: {
      venue,
      weather,
      refereeStrictness,
      extraTime,
    },
    rawParsedSummary: summary,
  };
}
