import { 
  Team, 
  MatchResult, 
  MatchEvent, 
  MatchStats, 
  SimSettings, 
  PenaltyShootout,
  TacticType 
} from '../types';

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function clamp(val: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, val));
}

// Calculate tactical advantage multiplier
function getTacticalMultiplier(tacticA: TacticType, tacticB: TacticType): { advA: number; advB: number } {
  let advA = 1.0;
  let advB = 1.0;

  if (tacticA === 'High Press & Counter' && tacticB === 'Tiki-Taka Possession') {
    advA += 0.12;
  } else if (tacticA === 'Tiki-Taka Possession' && tacticB === 'Park the Bus') {
    advA += 0.08;
  } else if (tacticA === 'Park the Bus' && tacticB === 'All-Out Attack') {
    advA += 0.15;
  } else if (tacticA === 'All-Out Attack' && tacticB === 'Balanced Control') {
    advA += 0.06;
  }

  // Symmetric check
  if (tacticB === 'High Press & Counter' && tacticA === 'Tiki-Taka Possession') {
    advB += 0.12;
  } else if (tacticB === 'Tiki-Taka Possession' && tacticA === 'Park the Bus') {
    advB += 0.08;
  } else if (tacticB === 'Park the Bus' && tacticA === 'All-Out Attack') {
    advB += 0.15;
  }

  return { advA, advB };
}

// Football Match Simulation Engine
export function simulateFootballMatch(
  teamA: Team,
  teamB: Team,
  customTacticA?: TacticType,
  customTacticB?: TacticType,
  settings?: Partial<SimSettings>
): MatchResult {
  const tacticA = customTacticA || teamA.defaultTactic;
  const tacticB = customTacticB || teamB.defaultTactic;
  const randomFactor = (settings?.randomFactor ?? 25) / 100; // 0.0 to 1.0
  const allowExtraTime = settings?.allowExtraTime ?? true;
  const allowPenalties = settings?.allowPenalties ?? true;

  const { advA, advB } = getTacticalMultiplier(tacticA, tacticB);

  // Ratings calculation with variance
  const luckA = (Math.random() * 2 - 1) * randomFactor * 20;
  const luckB = (Math.random() * 2 - 1) * randomFactor * 20;

  const effectiveAttA = (teamA.attackRating * 0.5 + (teamA.midfieldRating ?? 80) * 0.3 + teamA.form * 2) * advA + luckA;
  const effectiveDefA = (teamA.defenseRating * 0.6 + (teamA.goalkeeperRating ?? 80) * 0.4 + teamA.form) + luckA * 0.5;

  const effectiveAttB = (teamB.attackRating * 0.5 + (teamB.midfieldRating ?? 80) * 0.3 + teamB.form * 2) * advB + luckB;
  const effectiveDefB = (teamB.defenseRating * 0.6 + (teamB.goalkeeperRating ?? 80) * 0.4 + teamB.form) + luckB * 0.5;

  const events: MatchEvent[] = [];
  let scoreA = 0;
  let scoreB = 0;

  // Possession calculation
  const totalMidfield = (teamA.midfieldRating ?? 80) + (teamB.midfieldRating ?? 80);
  const basePossA = Math.round(((teamA.midfieldRating ?? 80) / totalMidfield) * 100);
  const possVariance = getRandomInt(-6, 6);
  const possessionA = clamp(basePossA + possVariance + (tacticA === 'Tiki-Taka Possession' ? 8 : 0) - (tacticB === 'Tiki-Taka Possession' ? 8 : 0), 28, 72);
  const possessionB = 100 - possessionA;

  // Shots calculation
  const shotsA = Math.max(3, Math.round((effectiveAttA / 10) + getRandomInt(0, 8)));
  const shotsB = Math.max(3, Math.round((effectiveAttB / 10) + getRandomInt(0, 8)));
  const shotsOnTargetA = Math.min(shotsA, Math.max(1, Math.round(shotsA * (0.35 + Math.random() * 0.25))));
  const shotsOnTargetB = Math.min(shotsB, Math.max(1, Math.round(shotsB * (0.35 + Math.random() * 0.25))));

  let xGA = 0;
  let xGB = 0;
  let yellowCardsA = 0;
  let yellowCardsB = 0;
  let redCardsA = 0;
  let redCardsB = 0;
  let foulsA = getRandomInt(6, 16);
  let foulsB = getRandomInt(6, 16);
  let cornersA = getRandomInt(2, 9);
  let cornersB = getRandomInt(2, 9);

  const playersA = teamA.players.length > 0 ? teamA.players : [{ id: 'pA', name: `${teamA.shortName} Striker`, position: 'FW', rating: 85, number: 9 }];
  const playersB = teamB.players.length > 0 ? teamB.players : [{ id: 'pB', name: `${teamB.shortName} Striker`, position: 'FW', rating: 85, number: 9 }];

  const forwardsA = playersA.filter(p => p.position === 'FW' || p.position === 'MF');
  const forwardsB = playersB.filter(p => p.position === 'FW' || p.position === 'MF');

  const getScorer = (teamPlayers: typeof playersA) => {
    const fwList = teamPlayers.filter(p => p.position === 'FW');
    if (fwList.length > 0 && Math.random() < 0.7) {
      return fwList[Math.floor(Math.random() * fwList.length)];
    }
    return teamPlayers[Math.floor(Math.random() * teamPlayers.length)];
  };

  const getAssister = (teamPlayers: typeof playersA, scorerId: string) => {
    const others = teamPlayers.filter(p => p.id !== scorerId);
    if (others.length === 0 || Math.random() < 0.2) return undefined;
    return others[Math.floor(Math.random() * others.length)].name;
  };

  // Kickoff Event
  events.push({
    id: 'evt-0',
    minute: 1,
    phase: '1st Half',
    type: 'commentary',
    teamId: teamA.id,
    description: `Referee blows the opening whistle! ${teamA.name} and ${teamB.name} kick off under electric atmosphere.`,
    scoreSnapshot: [0, 0],
    isHighlight: false,
  });

  const totalRegularMinutes = 90;
  const numMoments = getRandomInt(8, 14);
  const momentMinutes = Array.from({ length: numMoments }, () => getRandomInt(3, totalRegularMinutes)).sort((a, b) => a - b);

  // Generate dynamic events
  momentMinutes.forEach((minute, idx) => {
    const isTeamAAttacking = Math.random() * 100 < (possessionA + (effectiveAttA - effectiveDefB));
    const activeTeam = isTeamAAttacking ? teamA : teamB;
    const opponentTeam = isTeamAAttacking ? teamB : teamA;
    const isA = activeTeam.id === teamA.id;
    const currentPhase = minute <= 45 ? '1st Half' : '2nd Half';

    // Chance of Goal
    const attPower = isA ? effectiveAttA : effectiveAttB;
    const defPower = isA ? effectiveDefB : effectiveDefA;
    const goalProb = (attPower / (attPower + defPower * 1.8)) * 0.45;

    if (Math.random() < goalProb) {
      // GOAL!
      if (isA) {
        scoreA++;
        xGA += 0.72;
      } else {
        scoreB++;
        xGB += 0.72;
      }
      const scorer = getScorer(isA ? playersA : playersB);
      const assist = getAssister(isA ? playersA : playersB, scorer.id);

      const goalFlavors = [
        `GOAL! Tremendous finish into the top corner by ${scorer.name}!`,
        `GOAL! ${scorer.name} connects with a clinical header past the keeper!`,
        `GOAL! Lightning counter-attack finished off by ${scorer.name}!`,
        `GOAL! ${scorer.name} fires a venomous strike from outside the box!`
      ];

      events.push({
        id: `evt-${idx}-${minute}`,
        minute,
        phase: currentPhase,
        type: 'goal',
        teamId: activeTeam.id,
        player: scorer.name,
        assistPlayer: assist,
        description: goalFlavors[Math.floor(Math.random() * goalFlavors.length)],
        scoreSnapshot: [scoreA, scoreB],
        isHighlight: true,
        fieldCoordinates: { x: isA ? 88 : 12, y: getRandomInt(35, 65) }
      });
    } else if (Math.random() < 0.28) {
      // Big Save or Miss
      const shotTaker = (isA ? forwardsA : forwardsB)[0]?.name || activeTeam.name;
      const keeperName = isA 
        ? (playersB.find(p => p.position === 'GK')?.name || `${teamB.shortName} Goalkeeper`)
        : (playersA.find(p => p.position === 'GK')?.name || `${teamA.shortName} Goalkeeper`);
      
      if (isA) xGA += 0.25; else xGB += 0.25;

      events.push({
        id: `evt-${idx}-${minute}`,
        minute,
        phase: currentPhase,
        type: 'save',
        teamId: activeTeam.id,
        player: keeperName,
        description: `Sensational diving reflex stop by ${keeperName} to deny a venomous strike from ${shotTaker}!`,
        scoreSnapshot: [scoreA, scoreB],
        isHighlight: true,
        fieldCoordinates: { x: isA ? 82 : 18, y: getRandomInt(30, 70) }
      });
    } else if (Math.random() < 0.22) {
      // Yellow Card / Foul
      if (isA) yellowCardsB++; else yellowCardsA++;
      const fouledPlayer = (isA ? playersB : playersA)[getRandomInt(0, Math.min(4, (isA ? playersB : playersA).length - 1))];

      events.push({
        id: `evt-${idx}-${minute}`,
        minute,
        phase: currentPhase,
        type: 'card_yellow',
        teamId: opponentTeam.id,
        player: fouledPlayer?.name || 'Defender',
        description: `Tactical foul by ${fouledPlayer?.name || opponentTeam.name}. Referee issues a yellow card!`,
        scoreSnapshot: [scoreA, scoreB],
        isHighlight: false,
      });
    } else {
      // Midfield Tactical Play / Corner
      events.push({
        id: `evt-${idx}-${minute}`,
        minute,
        phase: currentPhase,
        type: 'commentary',
        teamId: activeTeam.id,
        description: `${activeTeam.name} build dangerous pressure through midfield channels with crisp passing rotations.`,
        scoreSnapshot: [scoreA, scoreB],
        isHighlight: false,
      });
    }
  });

  // Half time event
  events.splice(Math.floor(events.length / 2), 0, {
    id: 'evt-ht',
    minute: 45,
    phase: '1st Half',
    type: 'commentary',
    teamId: teamA.id,
    description: `Half-time whistle! Score stands at ${teamA.shortName} ${scoreA} - ${scoreB} ${teamB.shortName}. Managers preparing tactical tweaks in the locker room.`,
    scoreSnapshot: [scoreA, scoreB],
    isHighlight: false,
  });

  // Extra Time check if tied and enabled
  let wentToExtraTime = false;
  let wentToPenalties = false;
  let penaltyShootout: PenaltyShootout | undefined = undefined;

  if (scoreA === scoreB && allowExtraTime) {
    wentToExtraTime = true;
    events.push({
      id: 'evt-et-start',
      minute: 90,
      phase: 'Extra Time',
      type: 'commentary',
      teamId: teamA.id,
      description: `Full time stalemate (${scoreA} - ${scoreB})! 30 minutes of Extra Time begins under immense tension!`,
      scoreSnapshot: [scoreA, scoreB],
      isHighlight: true,
    });

    // Chance of extra time goal
    if (Math.random() < 0.4) {
      const isA = Math.random() > 0.5;
      const etMin = getRandomInt(98, 118);
      if (isA) {
        scoreA++;
        xGA += 0.65;
        const scorer = getScorer(playersA);
        events.push({
          id: `evt-et-goal`,
          minute: etMin,
          phase: 'Extra Time',
          type: 'goal',
          teamId: teamA.id,
          player: scorer.name,
          description: `EXTRA TIME THRILLER! ${scorer.name} strikes in the ${etMin}' minute! Incredible drama!`,
          scoreSnapshot: [scoreA, scoreB],
          isHighlight: true,
        });
      } else {
        scoreB++;
        xGB += 0.65;
        const scorer = getScorer(playersB);
        events.push({
          id: `evt-et-goal`,
          minute: etMin,
          phase: 'Extra Time',
          type: 'goal',
          teamId: teamB.id,
          player: scorer.name,
          description: `EXTRA TIME THRILLER! ${scorer.name} scores a clutch extra-time goal in the ${etMin}' minute!`,
          scoreSnapshot: [scoreA, scoreB],
          isHighlight: true,
        });
      }
    }
  }

  // Penalties if still tied
  if (scoreA === scoreB && allowPenalties) {
    wentToPenalties = true;
    let penA = 0;
    let penB = 0;
    const penRounds = [];

    for (let r = 1; r <= 5; r++) {
      const aScored = Math.random() < 0.78;
      const bScored = Math.random() < 0.78;
      if (aScored) penA++;
      if (bScored) penB++;

      penRounds.push({
        roundNumber: r,
        teamATaker: playersA[(r - 1) % playersA.length]?.name || `Taker ${r}`,
        teamAScored: aScored,
        teamBTaker: playersB[(r - 1) % playersB.length]?.name || `Taker ${r}`,
        teamBScored: bScored,
      });
    }

    // Sudden death if still tied
    let suddenRound = 6;
    while (penA === penB && suddenRound <= 11) {
      const aScored = Math.random() < 0.72;
      const bScored = Math.random() < 0.72;
      if (aScored) penA++;
      if (bScored) penB++;

      penRounds.push({
        roundNumber: suddenRound,
        teamATaker: playersA[(suddenRound - 1) % playersA.length]?.name || `Taker ${suddenRound}`,
        teamAScored: aScored,
        teamBTaker: playersB[(suddenRound - 1) % playersB.length]?.name || `Taker ${suddenRound}`,
        teamBScored: bScored,
      });
      suddenRound++;
    }

    // Fallback if somehow still tied
    if (penA === penB) {
      penA++;
    }

    const penWinnerId = penA > penB ? teamA.id : teamB.id;
    penaltyShootout = {
      scoreA: penA,
      scoreB: penB,
      rounds: penRounds,
      winnerId: penWinnerId
    };

    events.push({
      id: 'evt-pens',
      minute: 120,
      phase: 'Penalties',
      type: 'penalty_scored',
      teamId: penWinnerId,
      description: `PENALTY SHOOTOUT DECIDER: ${penWinnerId === teamA.id ? teamA.name : teamB.name} triumph on penalties (${penA} - ${penB})!`,
      scoreSnapshot: [scoreA, scoreB],
      isHighlight: true,
    });
  }

  // Determine winner
  let winnerId: string | 'draw' = 'draw';
  if (penaltyShootout) {
    winnerId = penaltyShootout.winnerId;
  } else if (scoreA > scoreB) {
    winnerId = teamA.id;
  } else if (scoreB > scoreA) {
    winnerId = teamB.id;
  }

  // Generate Man of the Match
  const winningTeam = winnerId === teamA.id ? teamA : winnerId === teamB.id ? teamB : (scoreA >= scoreB ? teamA : teamB);
  const winningPlayers = winningTeam.id === teamA.id ? playersA : playersB;
  const motmPlayer = winningPlayers.length > 0 ? winningPlayers[0] : { name: 'Star Player', rating: 90 };
  const motmRating = +(8.2 + Math.random() * 1.6).toFixed(1);

  const stats: MatchStats = {
    possession: [possessionA, possessionB],
    shots: [shotsA, shotsB],
    shotsOnTarget: [shotsOnTargetA, shotsOnTargetB],
    xG: [+xGA.toFixed(2), +xGB.toFixed(2)],
    fouls: [foulsA, foulsB],
    corners: [cornersA, cornersB],
    yellowCards: [yellowCardsA, yellowCardsB],
    redCards: [redCardsA, redCardsB],
    passesCompleted: [Math.round(possessionA * 8.5), Math.round(possessionB * 8.5)],
    passAccuracy: [getRandomInt(81, 91), getRandomInt(80, 90)],
    saves: [shotsOnTargetB - scoreB + getRandomInt(1, 3), shotsOnTargetA - scoreA + getRandomInt(1, 3)],
    momentumHistory: Array.from({ length: 10 }, () => getRandomInt(-60, 60))
  };

  const venues = [
    'Metropolitan Grand Arena',
    'Santiago Bernabéu Stadium',
    'Wembley National Stadium',
    'Allianz Championship Arena',
    'San Siro Cathedral'
  ];

  return {
    id: `match-${Date.now()}-${getRandomInt(1000, 9999)}`,
    simulatedAt: Date.now(),
    sport: 'football',
    teamA,
    teamB,
    scoreA,
    scoreB,
    tacticA,
    tacticB,
    winnerId,
    events,
    stats,
    wentToExtraTime,
    wentToPenalties,
    penaltyShootout,
    manOfTheMatch: {
      name: motmPlayer.name,
      teamId: winningTeam.id,
      teamName: winningTeam.name,
      rating: motmRating,
      reason: `Masterclass performance controlling the tempo with decisive contributions.`
    },
    weather: settings?.weather || 'Clear',
    venue: venues[getRandomInt(0, venues.length - 1)],
    crowdAttendance: getRandomInt(54000, 88500)
  };
}

// Basketball Simulation Engine
export function simulateBasketballMatch(
  teamA: Team,
  teamB: Team,
  customTacticA?: TacticType,
  customTacticB?: TacticType,
  settings?: Partial<SimSettings>
): MatchResult {
  const events: MatchEvent[] = [];
  const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
  let scoreA = 0;
  let scoreB = 0;

  const playersA = teamA.players.length > 0 ? teamA.players : [{ id: 'pA', name: 'Star Guard', position: 'PG', rating: 90, number: 1 }];
  const playersB = teamB.players.length > 0 ? teamB.players : [{ id: 'pB', name: 'Star Guard', position: 'PG', rating: 90, number: 1 }];

  let threePointersA = 0;
  let threePointersB = 0;
  let fastBreakA = 0;
  let fastBreakB = 0;

  quarters.forEach((q, qIdx) => {
    events.push({
      id: `evt-${q}-start`,
      minute: (qIdx + 1) * 12,
      phase: q,
      type: 'commentary',
      teamId: teamA.id,
      description: `Start of ${q}! Fast-paced tempo on both ends of the hardwood.`,
      scoreSnapshot: [scoreA, scoreB],
      isHighlight: false,
    });

    const qPointsA = getRandomInt(22, 34) + Math.round((teamA.attackRating - 85) * 0.4);
    const qPointsB = getRandomInt(22, 34) + Math.round((teamB.attackRating - 85) * 0.4);

    scoreA += qPointsA;
    scoreB += qPointsB;

    const shooterA = playersA[getRandomInt(0, playersA.length - 1)];
    const shooterB = playersB[getRandomInt(0, playersB.length - 1)];

    if (Math.random() < 0.6) {
      threePointersA += getRandomInt(2, 5);
      events.push({
        id: `evt-${q}-three`,
        minute: qIdx * 12 + getRandomInt(3, 9),
        phase: q,
        type: 'three_pointer',
        teamId: teamA.id,
        player: shooterA.name,
        description: `BANG! ${shooterA.name} sinks a deep step-back 3-pointer from beyond the arc!`,
        scoreSnapshot: [scoreA - getRandomInt(4, 8), scoreB - getRandomInt(4, 8)],
        isHighlight: true,
      });
    }

    if (Math.random() < 0.6) {
      threePointersB += getRandomInt(2, 5);
      events.push({
        id: `evt-${q}-dunk`,
        minute: qIdx * 12 + getRandomInt(6, 11),
        phase: q,
        type: 'dunk',
        teamId: teamB.id,
        player: shooterB.name,
        description: `MONSTER SLAM! ${shooterB.name} skies above the rim for a vicious highlight poster dunk!`,
        scoreSnapshot: [scoreA - getRandomInt(2, 5), scoreB - getRandomInt(2, 5)],
        isHighlight: true,
      });
    }
  });

  // Overtime if tied
  let wentToExtraTime = false;
  if (scoreA === scoreB) {
    wentToExtraTime = true;
    const otA = getRandomInt(8, 15);
    const otB = getRandomInt(8, 15);
    scoreA += otA;
    scoreB += otB === otA ? otB + 2 : otB;

    events.push({
      id: 'evt-ot',
      minute: 53,
      phase: 'Overtime',
      type: 'clutch_kill',
      teamId: scoreA > scoreB ? teamA.id : teamB.id,
      description: `OVERTIME THRILLER! Clutch game-winning bucket as the final buzzer sounds!`,
      scoreSnapshot: [scoreA, scoreB],
      isHighlight: true,
    });
  }

  const winnerId = scoreA > scoreB ? teamA.id : teamB.id;
  const winningTeam = winnerId === teamA.id ? teamA : teamB;
  const winningPlayers = winnerId === teamA.id ? playersA : playersB;
  const motm = winningPlayers[0] || { name: 'MVP', rating: 95 };

  return {
    id: `bball-${Date.now()}-${getRandomInt(1000, 9999)}`,
    simulatedAt: Date.now(),
    sport: 'basketball',
    teamA,
    teamB,
    scoreA,
    scoreB,
    tacticA: customTacticA || teamA.defaultTactic,
    tacticB: customTacticB || teamB.defaultTactic,
    winnerId,
    events,
    wentToExtraTime,
    wentToPenalties: false,
    manOfTheMatch: {
      name: motm.name,
      teamId: winningTeam.id,
      teamName: winningTeam.name,
      rating: +(9.1 + Math.random() * 0.8).toFixed(1),
      reason: `Explosive scoring output and dominant floor leadership.`
    },
    stats: {
      possession: [50, 50],
      shots: [Math.round(scoreA * 0.9), Math.round(scoreB * 0.9)],
      shotsOnTarget: [Math.round(scoreA * 0.5), Math.round(scoreB * 0.5)],
      xG: [scoreA, scoreB],
      fouls: [getRandomInt(12, 22), getRandomInt(12, 22)],
      corners: [0, 0],
      yellowCards: [0, 0],
      redCards: [0, 0],
      passesCompleted: [getRandomInt(220, 310), getRandomInt(220, 310)],
      passAccuracy: [getRandomInt(88, 96), getRandomInt(88, 96)],
      saves: [getRandomInt(4, 9), getRandomInt(4, 9)],
      fastBreakPoints: [fastBreakA + getRandomInt(14, 26), fastBreakB + getRandomInt(14, 26)],
      threePointersMade: [threePointersA + getRandomInt(8, 16), threePointersB + getRandomInt(8, 16)],
      momentumHistory: Array.from({ length: 10 }, () => getRandomInt(-70, 70))
    },
    weather: 'Indoor Roof',
    venue: 'United Center Grand Arena',
    crowdAttendance: getRandomInt(19500, 22000)
  };
}

// Universal Generic Match Simulator Router
export function simulateUniversalMatch(
  teamA: Team,
  teamB: Team,
  customTacticA?: TacticType,
  customTacticB?: TacticType,
  settings?: Partial<SimSettings>
): MatchResult {
  if (teamA.sport === 'basketball' || teamB.sport === 'basketball') {
    return simulateBasketballMatch(teamA, teamB, customTacticA, customTacticB, settings);
  }
  return simulateFootballMatch(teamA, teamB, customTacticA, customTacticB, settings);
}
