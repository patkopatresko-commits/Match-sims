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

/**
 * Universal Prompt Parser:
 * Accurately parses team names, tactics, formations, player numbers, and player lineups
 * without forcing or adding artificial players when users remove or specify custom lineups.
 */
export function parseMatchPrompt(promptText: string): ParsedPromptResult {
  const cleanText = (promptText || '').trim();
  const lower = cleanText.toLowerCase();

  // 1. Match Conditions Extraction
  let venue: 'Neutral' | 'Team A Home' | 'Team B Home' = 'Neutral';
  if (lower.includes('team a home') || lower.includes('home advantage for team a') || lower.includes('home: team a') || lower.includes('stadium: home')) {
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

  // 2. Segmenting Team A and Team B
  let segmentA = '';
  let segmentB = '';

  // Look for explicit team delimiters
  if (/team\s*(?:b|2|two|away)\s*[:\-]/i.test(cleanText)) {
    const parts = cleanText.split(/team\s*(?:b|2|two|away)\s*[:\-]/i);
    segmentA = parts[0] || '';
    segmentB = parts.slice(1).join('\n');
  } else if (/\n\s*(?:away team|second team|team 2|opponent)\s*[:\-]/i.test(cleanText)) {
    const parts = cleanText.split(/\n\s*(?:away team|second team|team 2|opponent)\s*[:\-]/i);
    segmentA = parts[0] || '';
    segmentB = parts.slice(1).join('\n');
  } else if (/\bvs\b|\bversus\b/i.test(cleanText)) {
    const parts = cleanText.split(/\bvs\b|\bversus\b/i);
    segmentA = parts[0] || '';
    segmentB = parts.slice(1).join('\n');
  } else {
    // If lines exist, split halfway
    const lines = cleanText.split('\n');
    if (lines.length > 1) {
      const mid = Math.ceil(lines.length / 2);
      segmentA = lines.slice(0, mid).join('\n');
      segmentB = lines.slice(mid).join('\n');
    } else {
      segmentA = cleanText;
      segmentB = '';
    }
  }

  // 3. Helper to parse individual player string and extract shirt number, position, rating, form, and name
  const parsePlayerToken = (rawToken: string, defaultIndex: number, teamIndex: number): FootballPlayer | null => {
    let token = rawToken.trim();
    if (!token || token.length < 2) return null;

    // 1. Extract Shirt Number
    // Matches: "1.", "7 -", "#10", "No. 9", "23)", "14 "
    let playerNumber = defaultIndex + 1;
    const numMatch = token.match(/^(?:no\.?|#)?\s*(\d{1,2})\s*[\.\-\):]?\s*/i) || token.match(/#(\d{1,2})\b/);
    if (numMatch) {
      const parsedNum = parseInt(numMatch[1], 10);
      if (parsedNum > 0 && parsedNum <= 99) {
        playerNumber = parsedNum;
      }
      // Remove leading number from token
      token = token.replace(/^(?:no\.?|#)?\s*\d{1,2}\s*[\.\-\):]?\s*/i, '').trim();
    }

    // 2. Extract Position
    let pos: Position = 'MF';
    if (/\b(GK|goalkeeper|keeper)\b/i.test(token) || defaultIndex === 0) pos = 'GK';
    else if (/\b(DF|CB|LB|RB|defender|back)\b/i.test(token)) pos = 'DF';
    else if (/\b(FW|ST|CF|RW|LW|striker|forward|winger)\b/i.test(token)) pos = 'FW';
    else if (/\b(MF|CM|DM|CAM|midfielder)\b/i.test(token)) pos = 'MF';
    else {
      if (defaultIndex === 0) pos = 'GK';
      else if (defaultIndex >= 1 && defaultIndex <= 4) pos = 'DF';
      else if (defaultIndex >= 5 && defaultIndex <= 7) pos = 'MF';
      else pos = 'FW';
    }

    // 3. Extract Overall Rating
    let overall = 84;
    const ovrMatch = token.match(/\b([4-9]\d)\s*(?:ovr|rating)?\b/i);
    if (ovrMatch) {
      overall = parseInt(ovrMatch[1], 10);
    }

    // 4. Extract Form Rating
    let form = 7.5;
    const formMatch = token.match(/\b([1-9]\.\d)\s*(?:form)?\b/i);
    if (formMatch) {
      form = parseFloat(formMatch[1]);
    }

    // 5. Clean Name
    let cleanName = token
      .replace(/\((?:GK|DF|MF|FW|CB|LB|RB|CM|DM|CAM|ST|CF|RW|LW|goalkeeper|defender|midfielder|forward|striker)\)/gi, '')
      .replace(/\b(?:GK|DF|MF|FW|CB|LB|RB|CM|DM|CAM|ST|CF|RW|LW)\b/gi, '')
      .replace(/\b([4-9]\d)\s*(?:ovr|rating)?\b/gi, '')
      .replace(/\b([1-9]\.\d)\s*(?:form)?\b/gi, '')
      .replace(/#\d{1,2}\b/g, '')
      .replace(/[,\(\)\-\[\]]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    if (!cleanName || cleanName.length < 2 || cleanName.match(/^(?:lineup|formation|tactics|mentality|press|referee|weather|venue)$/i)) {
      return null;
    }

    return {
      id: `p-${teamIndex}-${defaultIndex + 1}`,
      name: cleanName,
      number: playerNumber,
      position: pos,
      overall,
      form,
      startingStamina: 100,
    };
  };

  // 4. Helper to parse team from segment
  const parseTeam = (segment: string, fallbackName: string, defaultEmoji: string, teamIndex: number): FootballTeamInput => {
    const segLower = segment.toLowerCase();
    const rawLines = segment.split('\n').map(l => l.trim()).filter(Boolean);

    // Extract Team Name
    let teamName = fallbackName;
    const nameMatch = segment.match(/(?:team\s*(?:a|b|1|2|home|away)?\s*[:\-]\s*|name\s*[:\-]\s*)([^\n,\.]+)/i);
    if (nameMatch && nameMatch[1]?.trim()) {
      teamName = nameMatch[1].trim();
    } else if (rawLines.length > 0) {
      const firstLine = rawLines[0]
        .replace(/^(?:team\s*(?:a|b|1|2|home|away)?|home|away)\s*[:\-]?\s*/i, '')
        .trim();
      if (firstLine.length >= 2 && firstLine.length <= 40 && !firstLine.match(/lineup|tactic|formation|4-3-3|4-4-2|gk|ovr/i)) {
        teamName = firstLine;
      }
    }

    // Extract Formation
    let formation = '4-3-3';
    const formMatch = segment.match(/\b(\d\-\d\-\d(?:\-\d)?)\b/);
    if (formMatch) {
      formation = formMatch[1];
    } else if (segLower.includes('5-3-2') || segLower.includes('5-2-3') || segLower.includes('5-4-1')) {
      formation = '5-3-2';
    } else if (segLower.includes('3-5-2') || segLower.includes('3-4-3')) {
      formation = '3-5-2';
    } else if (segLower.includes('4-4-2')) {
      formation = '4-4-2';
    } else if (segLower.includes('4-2-3-1')) {
      formation = '4-2-3-1';
    }

    // Extract Mentality
    let mentality: Mentality = 'Balanced';
    if (segLower.includes('all-out attack') || segLower.includes('all out attack') || segLower.includes('hyper attack') || segLower.includes('overload attack')) {
      mentality = 'All-Out Attack';
    } else if (segLower.includes('park the bus') || segLower.includes('ultra defensive') || segLower.includes('heavy defense') || segLower.includes('bunker')) {
      mentality = 'Ultra Defensive';
    } else if (segLower.includes('attacking') || segLower.includes('offensive') || segLower.includes('forward thinking') || segLower.includes('front foot')) {
      mentality = 'Attacking';
    } else if (segLower.includes('defensive') || segLower.includes('counter-attack') || segLower.includes('counter attack') || segLower.includes('contain') || segLower.includes('sit back')) {
      mentality = 'Defensive';
    }

    // Extract Pressing
    let pressing: Pressing = 'Mid Block';
    if (segLower.includes('high press') || segLower.includes('gegenpress') || segLower.includes('counter-press') || segLower.includes('heavy press') || segLower.includes('press high') || segLower.includes('aggressive pressing') || segLower.includes('hunt ball')) {
      pressing = 'High Press & Counter-Press';
    } else if (segLower.includes('low block') || segLower.includes('drop deep') || segLower.includes('compact') || segLower.includes('deep line') || segLower.includes('stand off')) {
      pressing = 'Low Block';
    }

    // Extract Tackling
    let tackling: Tackling = 'Normal';
    if (segLower.includes('aggressive tackling') || segLower.includes('hard tackle') || segLower.includes('physical') || segLower.includes('rough') || segLower.includes('commit fouls') || segLower.includes('crunching')) {
      tackling = 'Aggressive';
    } else if (segLower.includes('cautious') || segLower.includes('stay on feet') || segLower.includes('no fouls') || segLower.includes('jockey') || segLower.includes('gentle')) {
      tackling = 'Cautious';
    }

    // Extract Tempo
    let tempo: Tempo = 'Standard';
    if (segLower.includes('high tempo') || segLower.includes('fast pace') || segLower.includes('direct') || segLower.includes('vertical') || segLower.includes('long ball') || segLower.includes('quick transition') || segLower.includes('route one')) {
      tempo = 'Direct & High Tempo';
    } else if (segLower.includes('slow') || segLower.includes('patient') || segLower.includes('tiki-taka') || segLower.includes('possession') || segLower.includes('control') || segLower.includes('keep ball')) {
      tempo = 'Slow & Patient';
    }

    // Extract ONLY the Explicit Players Provided
    const parsedPlayers: FootballPlayer[] = [];

    // Check if lineup is written as a comma-separated list
    const lineupBlockMatch = segment.match(/(?:lineup|starting xi|players|squad)\s*[:\-]\s*([^\n\r]+(?:,\s*[^\n\r]+){1,})/i);
    if (lineupBlockMatch && lineupBlockMatch[1]) {
      const tokens = lineupBlockMatch[1].split(/[,;]/).map(t => t.trim()).filter(Boolean);
      tokens.forEach((tok, idx) => {
        const player = parsePlayerToken(tok, idx, teamIndex);
        if (player && !parsedPlayers.some(p => p.name.toLowerCase() === player.name.toLowerCase())) {
          parsedPlayers.push(player);
        }
      });
    }

    // If no comma-list, parse line-by-line
    if (parsedPlayers.length === 0) {
      let isInsideLineupSection = false;
      for (const line of rawLines) {
        if (/^(?:lineup|starting xi|players|squad)\s*[:\-]?$/i.test(line)) {
          isInsideLineupSection = true;
          continue;
        }

        // Skip other tactical headers
        if (/^(?:team|venue|weather|referee|formation|tactics|mentality|tempo|pressing|tackling)\s*[:\-]/i.test(line)) {
          isInsideLineupSection = false;
          continue;
        }

        const player = parsePlayerToken(line, parsedPlayers.length, teamIndex);
        if (player) {
          if (!parsedPlayers.some(p => p.name.toLowerCase() === player.name.toLowerCase())) {
            parsedPlayers.push(player);
          }
        }
      }
    }

    // STRICT ROSTER SANITY:
    // If the user provided players (whether 1, 5, 10, or 11), use EXACTLY those players!
    // Do NOT pad with fake generic players when the user intentionally removes or specifies a roster.
    let finalRoster: FootballPlayer[] = [...parsedPlayers];

    // Only fallback if the segment had absolutely zero players typed
    if (finalRoster.length === 0) {
      finalRoster = [
        { id: `gen-${teamIndex}-1`, name: `${teamName} Goalkeeper`, number: 1, position: 'GK', overall: 82, form: 7.5, startingStamina: 100 },
        { id: `gen-${teamIndex}-2`, name: `${teamName} Defender 1`, number: 2, position: 'DF', overall: 82, form: 7.5, startingStamina: 100 },
        { id: `gen-${teamIndex}-3`, name: `${teamName} Defender 2`, number: 3, position: 'DF', overall: 82, form: 7.5, startingStamina: 100 },
        { id: `gen-${teamIndex}-4`, name: `${teamName} Defender 3`, number: 4, position: 'DF', overall: 82, form: 7.5, startingStamina: 100 },
        { id: `gen-${teamIndex}-5`, name: `${teamName} Defender 4`, number: 5, position: 'DF', overall: 82, form: 7.5, startingStamina: 100 },
        { id: `gen-${teamIndex}-6`, name: `${teamName} Midfielder 1`, number: 6, position: 'MF', overall: 82, form: 7.5, startingStamina: 100 },
        { id: `gen-${teamIndex}-7`, name: `${teamName} Midfielder 2`, number: 7, position: 'MF', overall: 82, form: 7.5, startingStamina: 100 },
        { id: `gen-${teamIndex}-8`, name: `${teamName} Midfielder 3`, number: 8, position: 'MF', overall: 82, form: 7.5, startingStamina: 100 },
        { id: `gen-${teamIndex}-9`, name: `${teamName} Forward 1`, number: 9, position: 'FW', overall: 82, form: 7.5, startingStamina: 100 },
        { id: `gen-${teamIndex}-10`, name: `${teamName} Forward 2`, number: 10, position: 'FW', overall: 82, form: 7.5, startingStamina: 100 },
        { id: `gen-${teamIndex}-11`, name: `${teamName} Forward 3`, number: 11, position: 'FW', overall: 82, form: 7.5, startingStamina: 100 },
      ];
    }

    return {
      id: `team-${teamIndex}`,
      name: teamName,
      badgeEmoji: defaultEmoji,
      startingXI: finalRoster,
      bench: [],
      tactics: {
        formation,
        mentality,
        tempo,
        pressing,
        tackling,
      }
    };
  };

  const teamA = parseTeam(segmentA, 'Team A', '🔵', 0);
  const teamB = parseTeam(segmentB, 'Team B', '🔴', 1);

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
