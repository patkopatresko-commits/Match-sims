import { 
  FootballTeamInput, 
  FootballPlayer, 
  MatchVariables, 
  SimulationOutput, 
  GoalscorerInfo, 
  MatchStats, 
  PlayerMatchResult, 
  InjuryReport,
  ManOfTheMatch
} from '../types';

/**
 * PROMPT INJECTION SHIELD:
 * Strips out malicious prompt overrides, instruction modifications, and system leak attempts.
 */
export function sanitizeInputText(input: string): string {
  if (!input) return '';
  return input
    .replace(/\b(ignore (all )?previous instructions|system prompt|jailbreak|give (opponent|me) \d+ (goals|cards|red cards)|make score \d+-\d+|output commentary|override rules)\b/gi, '')
    .trim();
}

/**
 * Box-Muller Gaussian Random Generator for true natural performance variance
 */
function randomGaussian(mean = 0, stdev = 1): number {
  let u = 1 - Math.random();
  let v = Math.random();
  let z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
  return z * stdev + mean;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/**
 * Unbiased, High-Realism Football Match Simulation Engine
 */
export function simulateRealisticFootballMatch(
  teamA: FootballTeamInput,
  teamB: FootballTeamInput,
  matchVars: MatchVariables = {
    venue: 'Team A Home',
    weather: 'Clear / Mild',
    refereeStrictness: 'Standard',
    extraTime: false,
  }
): SimulationOutput {
  const matchMinutes = matchVars.extraTime ? 120 : 90;

  // Sanitize team names
  const cleanTeamAName = sanitizeInputText(teamA.name) || 'Team A';
  const cleanTeamBName = sanitizeInputText(teamB.name) || 'Team B';

  // 1. Calculate Core Positional Strengths with Form & Variance
  const getPlayerEffectiveRating = (p: FootballPlayer): number => {
    // Form rating typically 5.0 - 9.5 (baseline 7.0)
    const formModifier = ((p.form || 7.0) - 7.0) * 1.8;
    // Natural matchday variance (+- 4 rating variance)
    const matchVariance = randomGaussian(0, 3.2);
    // Stamina penalty if starting < 100
    const staminaModifier = ((p.startingStamina || 100) - 100) * 0.1;
    return clamp(p.overall + formModifier + matchVariance + staminaModifier, 45, 99);
  };

  const xiA = teamA.startingXI.slice(0, 11);
  const xiB = teamB.startingXI.slice(0, 11);

  const ratedA = xiA.map(p => ({ player: p, effective: getPlayerEffectiveRating(p) }));
  const ratedB = xiB.map(p => ({ player: p, effective: getPlayerEffectiveRating(p) }));

  const gkA = ratedA.filter(r => r.player.position === 'GK');
  const dfA = ratedA.filter(r => r.player.position === 'DF');
  const mfA = ratedA.filter(r => r.player.position === 'MF');
  const fwA = ratedA.filter(r => r.player.position === 'FW');

  const gkB = ratedB.filter(r => r.player.position === 'GK');
  const dfB = ratedB.filter(r => r.player.position === 'DF');
  const mfB = ratedB.filter(r => r.player.position === 'MF');
  const fwB = ratedB.filter(r => r.player.position === 'FW');

  const avg = (arr: { effective: number }[]) => arr.length ? arr.reduce((s, r) => s + r.effective, 0) / arr.length : 75;

  const attackPowerA = avg(fwA.length ? fwA : ratedA);
  const midPowerA = avg(mfA.length ? mfA : ratedA);
  const defPowerA = avg(dfA.length ? dfA : ratedA);
  const gkPowerA = avg(gkA.length ? gkA : ratedA);

  const attackPowerB = avg(fwB.length ? fwB : ratedB);
  const midPowerB = avg(mfB.length ? mfB : ratedB);
  const defPowerB = avg(dfB.length ? dfB : ratedB);
  const gkPowerB = avg(gkB.length ? gkB : ratedB);

  // Tactical Influences (Processed purely behind the scenes, never revealed)
  let tacticalOffenseA = 1.0;
  let tacticalDefenseA = 1.0;
  let tacticalPossessionA = 1.0;
  let staminaDrainA = 1.0;
  let foulRiskA = 1.0;

  let tacticalOffenseB = 1.0;
  let tacticalDefenseB = 1.0;
  let tacticalPossessionB = 1.0;
  let staminaDrainB = 1.0;
  let foulRiskB = 1.0;

  // Mentality multipliers
  if (teamA.tactics.mentality === 'All-Out Attack') { tacticalOffenseA = 1.25; tacticalDefenseA = 0.82; staminaDrainA = 1.15; }
  else if (teamA.tactics.mentality === 'Attacking') { tacticalOffenseA = 1.12; tacticalDefenseA = 0.92; staminaDrainA = 1.06; }
  else if (teamA.tactics.mentality === 'Defensive') { tacticalOffenseA = 0.85; tacticalDefenseA = 1.15; staminaDrainA = 0.94; }
  else if (teamA.tactics.mentality === 'Ultra Defensive') { tacticalOffenseA = 0.70; tacticalDefenseA = 1.28; staminaDrainA = 0.90; }

  if (teamB.tactics.mentality === 'All-Out Attack') { tacticalOffenseB = 1.25; tacticalDefenseB = 0.82; staminaDrainB = 1.15; }
  else if (teamB.tactics.mentality === 'Attacking') { tacticalOffenseB = 1.12; tacticalDefenseB = 0.92; staminaDrainB = 1.06; }
  else if (teamB.tactics.mentality === 'Defensive') { tacticalOffenseB = 0.85; tacticalDefenseB = 1.15; staminaDrainB = 0.94; }
  else if (teamB.tactics.mentality === 'Ultra Defensive') { tacticalOffenseB = 0.70; tacticalDefenseB = 1.28; staminaDrainB = 0.90; }

  // Pressing multipliers
  if (teamA.tactics.pressing === 'High Press & Counter-Press') { tacticalPossessionA *= 1.08; staminaDrainA *= 1.20; foulRiskA *= 1.25; }
  if (teamB.tactics.pressing === 'High Press & Counter-Press') { tacticalPossessionB *= 1.08; staminaDrainB *= 1.20; foulRiskB *= 1.25; }

  // Tackling multipliers
  if (teamA.tactics.tackling === 'Aggressive') { foulRiskA *= 1.45; tacticalDefenseA *= 1.05; }
  if (teamB.tactics.tackling === 'Aggressive') { foulRiskB *= 1.45; tacticalDefenseB *= 1.05; }

  // Home advantage
  let homeAdvA = matchVars.venue === 'Team A Home' ? 1.06 : (matchVars.venue === 'Team B Home' ? 0.94 : 1.0);
  let homeAdvB = matchVars.venue === 'Team B Home' ? 1.06 : (matchVars.venue === 'Team A Home' ? 0.94 : 1.0);

  // Weather impact
  let fatigueWeatherMult = matchVars.weather === 'Extreme Heat (High Fatigue)' ? 1.30 : (matchVars.weather === 'Heavy Rain (Slick Pitch)' ? 1.12 : 1.0);

  // 2. Statistical Simulation (xG, Possession, Passes, Shots)
  const baseMidRatio = (midPowerA * tacticalPossessionA * homeAdvA) / ((midPowerA * tacticalPossessionA * homeAdvA) + (midPowerB * tacticalPossessionB * homeAdvB));
  const rawPossessionA = Math.round(clamp(baseMidRatio * 100 + randomGaussian(0, 3.5), 32, 68));
  const rawPossessionB = 100 - rawPossessionA;

  // Expected Goals (xG) calculation
  const attackRatioA = (attackPowerA * tacticalOffenseA * homeAdvA) / (defPowerB * tacticalDefenseB * (gkPowerB / 80));
  const attackRatioB = (attackPowerB * tacticalOffenseB * homeAdvB) / (defPowerA * tacticalDefenseA * (gkPowerA / 80));

  const baseMinutesFactor = matchMinutes / 90;
  const rawXgA = clamp((attackRatioA * 1.55 + randomGaussian(0, 0.45)) * baseMinutesFactor, 0.25, 4.8);
  const rawXgB = clamp((attackRatioB * 1.55 + randomGaussian(0, 0.45)) * baseMinutesFactor, 0.25, 4.8);

  const xgA = Number(rawXgA.toFixed(2));
  const xgB = Number(rawXgB.toFixed(2));

  // Shots & Shots On Target
  const shotsA = Math.max(Math.round(xgA * 6.5 + randomGaussian(0, 2.5)), 3);
  const shotsB = Math.max(Math.round(xgB * 6.5 + randomGaussian(0, 2.5)), 3);

  const shotsOnTargetA = Math.min(Math.max(Math.round(shotsA * 0.42 + randomGaussian(0, 1.2)), 1), shotsA);
  const shotsOnTargetB = Math.min(Math.max(Math.round(shotsB * 0.42 + randomGaussian(0, 1.2)), 1), shotsB);

  // Passes & Pass Accuracy
  const basePassesA = Math.round(rawPossessionA * 8.8 * baseMinutesFactor);
  const basePassesB = Math.round(rawPossessionB * 8.8 * baseMinutesFactor);
  const passAccuracyA = clamp(Math.round(76 + (midPowerA - 75) * 0.55 + (rawPossessionA > 50 ? 4 : -2) + randomGaussian(0, 2)), 68, 94);
  const passAccuracyB = clamp(Math.round(76 + (midPowerB - 75) * 0.55 + (rawPossessionB > 50 ? 4 : -2) + randomGaussian(0, 2)), 68, 94);

  // Fouls & Cards
  const refStrictMult = matchVars.refereeStrictness === 'Strict' ? 1.35 : (matchVars.refereeStrictness === 'Lenient' ? 0.75 : 1.0);
  const foulsA = Math.max(Math.round((10 + randomGaussian(0, 2.5)) * foulRiskA * refStrictMult * baseMinutesFactor), 4);
  const foulsB = Math.max(Math.round((10 + randomGaussian(0, 2.5)) * foulRiskB * refStrictMult * baseMinutesFactor), 4);

  const yellowCardsA = Math.min(Math.floor(foulsA / 5.2 + (Math.random() > 0.45 ? 1 : 0)), 5);
  const yellowCardsB = Math.min(Math.floor(foulsB / 5.2 + (Math.random() > 0.45 ? 1 : 0)), 5);

  const redCardsA = Math.random() < (0.04 * foulRiskA * refStrictMult) ? 1 : 0;
  const redCardsB = Math.random() < (0.04 * foulRiskB * refStrictMult) ? 1 : 0;

  // Corners & Offsides
  const cornersA = Math.max(Math.round(shotsA * 0.38 + randomGaussian(0, 1.5)), 1);
  const cornersB = Math.max(Math.round(shotsB * 0.38 + randomGaussian(0, 1.5)), 1);
  const offsidesA = Math.max(Math.round(shotsA * 0.18 + randomGaussian(0, 1.0)), 0);
  const offsidesB = Math.max(Math.round(shotsB * 0.18 + randomGaussian(0, 1.0)), 0);

  // 3. Goal Conversion Simulation (Strict Roster Sanity: Only provided players)
  const simulateTeamGoals = (
    teamXg: number,
    teamPlayers: { player: FootballPlayer; effective: number }[],
    oppGk: { player: FootballPlayer; effective: number }[],
    teamId: string
  ): { goalsCount: number; goalEntries: GoalscorerInfo[] } => {
    // Poisson-derived goal chance
    let expected = teamXg;
    let goalsCount = 0;
    // Each on-target chance has conversion probability
    const potentialChances = Math.max(Math.round(expected + randomGaussian(0, 0.8)), 0);
    
    // Exact goals
    for (let c = 0; c < potentialChances; c++) {
      const conversionProb = 0.62 + (attackPowerA / 300);
      if (Math.random() < conversionProb) {
        goalsCount++;
      }
    }

    const goalEntries: GoalscorerInfo[] = [];
    const usedMinutes = new Set<number>();

    // Weight player goal probabilities (FW > MF > DF)
    const outfield = teamPlayers.filter(p => p.player.position !== 'GK');
    const playerWeights = outfield.map(p => {
      let w = 1.0;
      if (p.player.position === 'FW') w = 6.0 * (p.effective / 80);
      else if (p.player.position === 'MF') w = 2.8 * (p.effective / 80);
      else if (p.player.position === 'DF') w = 0.6 * (p.effective / 80);
      return { player: p.player, weight: w };
    });

    const totalWeight = playerWeights.reduce((s, pw) => s + pw.weight, 0);

    const pickScorer = (): FootballPlayer => {
      let r = Math.random() * totalWeight;
      for (const pw of playerWeights) {
        if (r < pw.weight) return pw.player;
        r -= pw.weight;
      }
      return playerWeights[0].player;
    };

    const pickAssister = (scorerId: string): FootballPlayer | null => {
      if (Math.random() < 0.22) return null; // Unassisted / solo / penalty
      const available = outfield.filter(p => p.player.id !== scorerId);
      if (!available.length) return null;
      // MF and FW more likely to assist
      const assistWeights = available.map(p => ({
        player: p.player,
        weight: p.player.position === 'MF' ? 4.5 : (p.player.position === 'FW' ? 3.0 : 1.2)
      }));
      const totalAWeight = assistWeights.reduce((s, w) => s + w.weight, 0);
      let r = Math.random() * totalAWeight;
      for (const aw of assistWeights) {
        if (r < aw.weight) return aw.player;
        r -= aw.weight;
      }
      return available[0].player;
    };

    for (let g = 0; g < goalsCount; g++) {
      let min = Math.floor(Math.random() * (matchMinutes - 2)) + 2;
      while (usedMinutes.has(min)) {
        min = Math.floor(Math.random() * (matchMinutes - 2)) + 2;
      }
      usedMinutes.add(min);

      const scorer = pickScorer();
      const isPenalty = Math.random() < 0.12;
      const assister = isPenalty ? null : pickAssister(scorer.id);

      goalEntries.push({
        scorerName: scorer.name,
        assisterName: assister ? assister.name : (isPenalty ? 'pen' : null),
        minute: min,
        isPenalty,
        teamId
      });
    }

    // Sort goals by minute
    goalEntries.sort((a, b) => a.minute - b.minute);

    return { goalsCount, goalEntries };
  };

  const resultA = simulateTeamGoals(xgA, ratedA, gkB, 'teamA');
  const resultB = simulateTeamGoals(xgB, ratedB, gkA, 'teamB');

  const scoreA = resultA.goalsCount;
  const scoreB = resultB.goalsCount;
  const allGoalscorers = [...resultA.goalEntries, ...resultB.goalEntries].sort((a, b) => a.minute - b.minute);

  // 4. Injuries & Medical Report Simulation
  const injuryReports: InjuryReport[] = [];
  const injuryDiagnoses = [
    { diagnosis: 'Grade 1 Hamstring Strain', recoveryTimeline: '2-3 weeks', severity: 'Minor' as const },
    { diagnosis: 'Sprained Ankle Ligament', recoveryTimeline: '3-4 weeks', severity: 'Moderate' as const },
    { diagnosis: 'Quadriceps Muscle Contusion', recoveryTimeline: '7-10 days', severity: 'Minor' as const },
    { diagnosis: 'Adductor Groin Pull', recoveryTimeline: '3-5 weeks', severity: 'Moderate' as const },
    { diagnosis: 'Meniscus Tear (Knee)', recoveryTimeline: '2-3 months', severity: 'Severe' as const },
  ];

  // Injury chance depends on tackling, fatigue, and weather
  const checkPlayerInjury = (player: FootballPlayer, teamName: string, foulRisk: number): InjuryReport | null => {
    const injuryProb = 0.035 * foulRisk * fatigueWeatherMult;
    if (Math.random() < injuryProb) {
      const diag = injuryDiagnoses[Math.floor(Math.random() * injuryDiagnoses.length)];
      return {
        playerName: player.name,
        teamName,
        diagnosis: diag.diagnosis,
        recoveryTimeline: diag.recoveryTimeline,
        severity: diag.severity
      };
    }
    return null;
  };

  // 5. Individual Player Performance Ratings (1.0 to 10.0 scale) & Fitness
  const processPlayerResults = (
    players: { player: FootballPlayer; effective: number }[],
    teamGoals: number,
    oppGoals: number,
    teamStats: { shotsOnTarget: number; passAcc: number; possession: number },
    teamId: string,
    teamName: string,
    staminaDrain: number,
    foulRisk: number,
    yellowCount: number,
    redCount: number
  ): PlayerMatchResult[] => {
    // Distribute cards among players
    const shuffled = [...players].sort(() => Math.random() - 0.5);
    const yellowAssigned = new Set<string>();
    for (let y = 0; y < Math.min(yellowCount, players.length); y++) {
      yellowAssigned.add(shuffled[y].player.id);
    }
    const redAssignedId = redCount > 0 && shuffled.length > 0 ? shuffled[shuffled.length - 1].player.id : null;

    return players.map(({ player, effective }) => {
      // Check goals & assists for this player
      const goals = allGoalscorers.filter(g => g.teamId === teamId && g.scorerName === player.name).length;
      const assists = allGoalscorers.filter(g => g.teamId === teamId && g.assisterName === player.name).length;

      // Base rating calibrated on overall, form, team performance, and individual variance
      let baseRating = 6.4 + ((effective - 75) * 0.05);

      // Positional modifiers
      if (player.position === 'GK') {
        baseRating += (oppGoals === 0 ? 1.0 : (oppGoals > 2 ? -0.8 : -oppGoals * 0.25));
        baseRating += randomGaussian(0, 0.4);
      } else if (player.position === 'DF') {
        baseRating += (oppGoals === 0 ? 0.8 : (oppGoals > 2 ? -0.7 : -oppGoals * 0.2));
        baseRating += randomGaussian(0, 0.35);
      } else if (player.position === 'MF') {
        baseRating += (teamStats.possession > 55 ? 0.4 : -0.2);
        baseRating += ((teamStats.passAcc - 80) * 0.02);
        baseRating += randomGaussian(0, 0.4);
      } else if (player.position === 'FW') {
        baseRating += (teamGoals > 2 ? 0.5 : (teamGoals === 0 ? -0.4 : 0.1));
        baseRating += randomGaussian(0, 0.45);
      }

      // Goal & assist bonuses
      baseRating += goals * 1.15;
      baseRating += assists * 0.65;

      // Card penalties
      const hasYellow = yellowAssigned.has(player.id);
      const hasRed = redAssignedId === player.id;
      if (hasYellow) baseRating -= 0.35;
      if (hasRed) baseRating -= 1.8;

      const finalRating = Number(clamp(baseRating, 4.0, 9.9).toFixed(1));

      // Fitness calculation: Stamina depletion
      const positionStaminaFactor = player.position === 'GK' ? 0.35 : (player.position === 'MF' ? 1.15 : 1.0);
      const drain = Math.round((28 + randomGaussian(0, 3.5)) * staminaDrain * fatigueWeatherMult * positionStaminaFactor * (matchMinutes / 90));
      const remainingStamina = clamp((player.startingStamina || 100) - drain, 15, 95);

      // Injury check
      const injury = checkPlayerInjury(player, teamName, foulRisk);
      if (injury) {
        injuryReports.push(injury);
      }

      return {
        playerId: player.id,
        name: player.name,
        position: player.position,
        number: player.number,
        teamId,
        teamName,
        rating: finalRating,
        remainingStamina,
        minutesPlayed: matchMinutes,
        goals,
        assists,
        yellowCards: hasYellow ? 1 : 0,
        redCard: hasRed,
        injury
      };
    });
  };

  const playerResultsA = processPlayerResults(
    ratedA,
    scoreA,
    scoreB,
    { shotsOnTarget: shotsOnTargetA, passAcc: passAccuracyA, possession: rawPossessionA },
    'teamA',
    cleanTeamAName,
    staminaDrainA,
    foulRiskA,
    yellowCardsA,
    redCardsA
  );

  const playerResultsB = processPlayerResults(
    ratedB,
    scoreB,
    scoreA,
    { shotsOnTarget: shotsOnTargetB, passAcc: passAccuracyB, possession: rawPossessionB },
    'teamB',
    cleanTeamBName,
    staminaDrainB,
    foulRiskB,
    yellowCardsB,
    redCardsB
  );

  // 6. Man of the Match (MOTM) Selection
  const allResults = [...playerResultsA, ...playerResultsB];
  allResults.sort((a, b) => b.rating - a.rating || (b.goals * 2 + b.assists) - (a.goals * 2 + a.assists));

  const motmPlayer = allResults[0] || {
    name: xiA[0]?.name || 'Captain',
    teamName: cleanTeamAName,
    rating: 8.5,
    goals: 0,
    assists: 0,
    position: 'FW'
  };

  let motmSummary = '';
  if (motmPlayer.goals >= 3) {
    motmSummary = `Delivered an extraordinary match-winning performance with a sensational hat-trick and relentless attacking drive.`;
  } else if (motmPlayer.goals === 2) {
    motmSummary = `Dominated the attacking third with a clinical brace and exceptional chance creation throughout the 90 minutes.`;
  } else if (motmPlayer.goals === 1 && motmPlayer.assists >= 1) {
    motmSummary = `Influenced every phase of play with a decisive goal, key assist, and commanding leadership on the pitch.`;
  } else if (motmPlayer.goals === 1) {
    motmSummary = `Scored the crucial goal while providing relentless forward threat and pinpoint precision in transition.`;
  } else if (motmPlayer.position === 'GK') {
    motmSummary = `Put on a goalkeeping masterclass with multiple crucial saves and authoritative penalty box control.`;
  } else if (motmPlayer.position === 'DF') {
    motmSummary = `Anchored the defensive line with commanding aerial dominance, decisive tackles, and composure under pressure.`;
  } else {
    motmSummary = `Dictated the tempo of the game with flawless passing distribution, tireless ball recovery, and elite positional discipline.`;
  }

  const manOfTheMatch: ManOfTheMatch = {
    playerName: motmPlayer.name,
    teamName: motmPlayer.teamName,
    rating: motmPlayer.rating,
    summary: motmSummary
  };

  // Compile Match Stats Sheet
  const stats: MatchStats = {
    possessionA: rawPossessionA,
    possessionB: rawPossessionB,
    shotsA,
    shotsB,
    shotsOnTargetA,
    shotsOnTargetB,
    xgA,
    xgB,
    passesA: basePassesA,
    passesB: basePassesB,
    passAccuracyA,
    passAccuracyB,
    foulsA,
    foulsB,
    yellowCardsA,
    yellowCardsB,
    redCardsA,
    redCardsB,
    cornersA,
    cornersB,
    offsidesA,
    offsidesB
  };

  // Medical Report Strings
  const medicalReportLines = injuryReports.length > 0
    ? injuryReports.map(inj => `${inj.playerName} (${inj.teamName}): ${inj.diagnosis} — Estimated recovery: ${inj.recoveryTimeline}`)
    : ['No injuries sustained'];

  // Construct STRICT text format strictly respecting user constraints
  const formatGoalscorers = (goals: GoalscorerInfo[]) => {
    if (!goals.length) return 'None';
    return goals
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

  const rawFormattedText = `1. 🏆 FINAL SCORELINE
${cleanTeamAName} ${scoreA} - ${scoreB} ${cleanTeamBName}
Goalscorers: ${formatGoalscorers(allGoalscorers)}

2. 📊 MATCH STAT SHEET
• Possession: ${cleanTeamAName} ${stats.possessionA}% - ${stats.possessionB}% ${cleanTeamBName}
• Shots (On Target): ${cleanTeamAName} ${stats.shotsA} (${stats.shotsOnTargetA}) - ${stats.shotsB} (${stats.shotsOnTargetB}) ${cleanTeamBName}
• xG: ${cleanTeamAName} ${stats.xgA.toFixed(2)} - ${stats.xgB.toFixed(2)} ${cleanTeamBName}
• Passes (Accuracy): ${cleanTeamAName} ${stats.passesA} (${stats.passAccuracyA}%) - ${stats.passesB} (${stats.passAccuracyB}%) ${cleanTeamBName}
• Fouls: ${cleanTeamAName} ${stats.foulsA} - ${stats.foulsB} ${cleanTeamBName}
• Cards (Yellow/Red): ${cleanTeamAName} ${stats.yellowCardsA}Y/${stats.redCardsA}R - ${stats.yellowCardsB}Y/${stats.redCardsB}R ${cleanTeamBName}
• Corners: ${cleanTeamAName} ${stats.cornersA} - ${stats.cornersB} ${cleanTeamBName}
• Offsides: ${cleanTeamAName} ${stats.offsidesA} - ${stats.offsidesB} ${cleanTeamBName}

3. 🔋 FINAL FITNESS SHEET
${cleanTeamAName}:
${playerResultsA.map(p => `• ${p.name} (${p.position}): ${p.remainingStamina}% stamina remaining`).join('\n')}

${cleanTeamBName}:
${playerResultsB.map(p => `• ${p.name} (${p.position}): ${p.remainingStamina}% stamina remaining`).join('\n')}

4. ⭐ INDIVIDUAL PLAYER RATINGS
${cleanTeamAName}:
${playerResultsA.map(p => `• ${p.name} (${p.position}): ${p.rating.toFixed(1)}/10.0`).join('\n')}

${cleanTeamBName}:
${playerResultsB.map(p => `• ${p.name} (${p.position}): ${p.rating.toFixed(1)}/10.0`).join('\n')}

5. 🏅 MAN OF THE MATCH (MOTM)
${manOfTheMatch.playerName} (${manOfTheMatch.teamName} - ${manOfTheMatch.rating.toFixed(1)}/10.0)
${manOfTheMatch.summary}

6. 🏥 MEDICAL REPORT
${medicalReportLines.map(line => `• ${line}`).join('\n')}`;

  return {
    teamAName: cleanTeamAName,
    teamBName: cleanTeamBName,
    scoreA,
    scoreB,
    goalscorers: allGoalscorers,
    stats,
    playerResultsA,
    playerResultsB,
    manOfTheMatch,
    medicalReport: medicalReportLines,
    rawFormattedText,
    simulatedAt: Date.now()
  };
}
