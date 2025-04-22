import { v4 as uuidv4 } from "uuid";

/**
 * Generate round-robin matches for a group of teams
 */
export function generateRoundRobinMatches(
  teams,
  bracket,
  startTime = new Date().toISOString(),
  defaultPitch = "Pitch 1"
) {
  if (teams.length < 2) return [];

  const matches = [];
  const teamsCopy = [...teams];

  // If odd number of teams, add a dummy team (bye)
  if (teamsCopy.length % 2 !== 0) {
    teamsCopy.push(null);
  }

  const n = teamsCopy.length;
  const rounds = n - 1;
  const matchesPerRound = n / 2;

  const generateTimeSlot = (baseTime, offsetHours) => {
    const time = new Date(baseTime);
    time.setHours(time.getHours() + offsetHours);
    return time.toISOString();
  };

  const baseTime = new Date(startTime);

  for (let round = 0; round < rounds; round++) {
    for (let match = 0; match < matchesPerRound; match++) {
      const homeIdx = match;
      const awayIdx = n - 1 - match;

      if (teamsCopy[homeIdx] === null || teamsCopy[awayIdx] === null) continue;

      matches.push({
        id: uuidv4(),
        teamA: teamsCopy[homeIdx],
        teamB: teamsCopy[awayIdx],
        scoreA: null,
        scoreB: null,
        pitch: `${defaultPitch} ${match + 1}`,
        time: generateTimeSlot(baseTime, round * matchesPerRound + match),
        status: "Scheduled",
        round: "Round Robin",
        bracket: bracket,
        marshall: ""
      });
    }

    teamsCopy.splice(1, 0, teamsCopy.pop());
  }

  return matches;
}

export function generateCrossoverMatches(
  poolATeams,
  poolBTeams,
  startTime,
  defaultPitch = "Pitch 1"
) {
  const sortedPoolA = [...poolATeams].sort((a, b) => (a.rank || 999) - (b.rank || 999));
  const sortedPoolB = [...poolBTeams].sort((a, b) => (a.rank || 999) - (b.rank || 999));

  const matches = [];
  const baseTime = new Date(startTime);

  for (let i = 0; i < Math.min(sortedPoolA.length, sortedPoolB.length); i++) {
    const teamA = sortedPoolA[i];
    const teamB = sortedPoolB[sortedPoolB.length - 1 - i];

    matches.push({
      id: uuidv4(),
      teamA: teamA,
      teamB: teamB,
      scoreA: null,
      scoreB: null,
      pitch: `${defaultPitch} ${i + 1}`,
      time: new Date(baseTime.getTime() + i * 60 * 60 * 1000).toISOString(),
      status: "Scheduled",
      round: "Crossover",
      bracket: "A",
      marshall: ""
    });
  }

  return matches;
}

export function generateEliminationMatches(
  teams,
  round,
  startTime,
  defaultPitch = "Pitch 1"
) {
  const matches = [];
  const baseTime = new Date(startTime);

  let numMatches = 0;
  switch (round) {
    case "Quarter-Finals":
      numMatches = 4;
      break;
    case "Semi-Finals":
      numMatches = 2;
      break;
    case "Finals":
      numMatches = 1;
      break;
  }

  for (let i = 0; i < numMatches; i++) {
    matches.push({
      id: uuidv4(),
      teamA: i * 2 < teams.length ? teams[i * 2] : null,
      teamB: i * 2 + 1 < teams.length ? teams[i * 2 + 1] : null,
      scoreA: null,
      scoreB: null,
      pitch: `${defaultPitch} ${i + 1}`,
      time: new Date(baseTime.getTime() + i * 60 * 60 * 1000).toISOString(),
      status: "Scheduled",
      round: round,
      bracket: "A",
      marshall: ""
    });
  }

  return matches;
}

export function updateTeamRankings(teams, matches) {
  const teamStats = new Map();

  teams.forEach((team) => {
    teamStats.set(team.id, { wins: 0, pointDiff: 0, points: 0 });
  });

  matches.forEach((match) => {
    if (
      match.status === "Completed" &&
      match.teamA &&
      match.teamB &&
      match.scoreA !== null &&
      match.scoreB !== null
    ) {
      const teamAStats = teamStats.get(match.teamA.id);
      const teamBStats = teamStats.get(match.teamB.id);

      if (teamAStats && teamBStats) {
        if (match.scoreA > match.scoreB) {
          teamAStats.wins += 1;
          teamAStats.points += 3;
        } else if (match.scoreB > match.scoreA) {
          teamBStats.wins += 1;
          teamBStats.points += 3;
        } else {
          teamAStats.points += 1;
          teamBStats.points += 1;
        }

        teamAStats.pointDiff += match.scoreA - match.scoreB;
        teamBStats.pointDiff += match.scoreB - match.scoreA;
      }
    }
  });

  const rankedTeams = [...teams].sort((a, b) => {
    const statsA = teamStats.get(a.id) || { wins: 0, pointDiff: 0, points: 0 };
    const statsB = teamStats.get(b.id) || { wins: 0, pointDiff: 0, points: 0 };

    if (statsB.points !== statsA.points) {
      return statsB.points - statsA.points;
    }
    if (statsB.pointDiff !== statsA.pointDiff) {
      return statsB.pointDiff - statsA.pointDiff;
    }
    return statsB.wins - statsA.wins;
  });

  return rankedTeams.map((team, index) => ({
    ...team,
    rank: index + 1
  }));
}

export function generateNextRound(
  currentRound,
  matches,
  teams,
  startTime = new Date().toISOString(),
  defaultPitch = "Pitch 1"
) {
  const completedMatches = matches.filter(
    (match) => match.round === currentRound && match.status === "Completed"
  );

  const allCurrentRoundMatches = matches.filter((match) => match.round === currentRound);
  if (completedMatches.length !== allCurrentRoundMatches.length) {
    return [];
  }

  let nextRound = "";
  switch (currentRound) {
    case "Round Robin":
      nextRound = "Crossover";
      break;
    case "Crossover":
      nextRound = "Quarter-Finals";
      break;
    case "Quarter-Finals":
      nextRound = "Semi-Finals";
      break;
    case "Semi-Finals":
      nextRound = "Finals";
      break;
    default:
      return [];
  }

  const winners = [];
  completedMatches.forEach((match) => {
    if (
      match.teamA &&
      match.teamB &&
      match.scoreA !== null &&
      match.scoreB !== null
    ) {
      if (match.scoreA > match.scoreB) {
        winners.push(match.teamA);
      } else if (match.scoreB > match.scoreA) {
        winners.push(match.teamB);
      } else {
        winners.push(match.teamA); // Fallback for tie
      }
    }
  });

  switch (nextRound) {
    case "Crossover":
      const poolATeams = teams.filter((team) => team.pool === "A");
      const poolBTeams = teams.filter((team) => team.pool === "B");
      return generateCrossoverMatches(poolATeams, poolBTeams, startTime, defaultPitch);

    case "Quarter-Finals":
    case "Semi-Finals":
    case "Finals":
      return generateEliminationMatches(winners, nextRound, startTime, defaultPitch);

    default:
      return [];
  }
}
