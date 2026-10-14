import { Match, StandingsRow, Team } from '../types/cricket';

/**
 * Converts overs representation like (overs: 19, balls: 4) or numeric 19.4 to decimal overs (19.66667)
 */
export function oversToDecimal(overs: number, balls: number = 0): number {
  return overs + balls / 6;
}

/**
 * Format complete overs and legal balls to standard cricket notation (e.g., "14.2")
 */
export function formatOvers(overs: number, balls: number): string {
  return `${overs}.${balls}`;
}

/**
 * Calculate Run Rate
 */
export function calculateRunRate(runs: number, overs: number, balls: number): number {
  const decimalOvers = oversToDecimal(overs, balls);
  if (decimalOvers === 0) return 0;
  return Number((runs / decimalOvers).toFixed(2));
}

/**
 * Calculate Required Run Rate for the chasing team
 */
export function calculateRequiredRunRate(
  target: number,
  currentRuns: number,
  totalOversLimit: number,
  currentOvers: number,
  currentBalls: number
): number | null {
  const remainingRuns = target - currentRuns;
  if (remainingRuns <= 0) return 0;
  const totalBallsLimit = totalOversLimit * 6;
  const ballsBowled = currentOvers * 6 + currentBalls;
  const remainingBalls = totalBallsLimit - ballsBowled;
  if (remainingBalls <= 0) return null;
  const remainingOvers = remainingBalls / 6;
  return Number((remainingRuns / remainingOvers).toFixed(2));
}

/**
 * Compute Points Table / Standings dynamically from recorded match records
 * Strictly adheres to cricket regulations:
 * - If a team is bowled out, full quota of overs is used for overs faced.
 * - NRR = (Total Runs Scored / Total Overs Faced) - (Total Runs Conceded / Total Overs Bowled)
 */
export function calculateStandings(
  teams: Team[],
  matches: Match[],
  pointsForWin = 2,
  pointsForTie = 1,
  pointsForNoResult = 1
): StandingsRow[] {
  const standingsMap: Record<string, {
    team: Team;
    played: number;
    won: number;
    lost: number;
    tied: number;
    noResult: number;
    points: number;
    runsScored: number;
    oversFacedDecimal: number;
    runsConceded: number;
    oversBowledDecimal: number;
    form: ('W' | 'L' | 'T' | 'NR')[];
  }> = {};

  teams.forEach((team) => {
    standingsMap[team.id] = {
      team,
      played: 0,
      won: 0,
      lost: 0,
      tied: 0,
      noResult: 0,
      points: 0,
      runsScored: 0,
      oversFacedDecimal: 0,
      runsConceded: 0,
      oversBowledDecimal: 0,
      form: [],
    };
  });

  // Only consider completed, tied, or no-result matches
  const finishedMatches = matches.filter(
    (m) => m.status === 'completed' || m.status === 'cancelled'
  );

  finishedMatches.forEach((m) => {
    const t1 = standingsMap[m.team1Id];
    const t2 = standingsMap[m.team2Id];
    if (!t1 || !t2) return;

    if (m.status === 'cancelled') {
      t1.played += 1;
      t1.noResult += 1;
      t1.points += pointsForNoResult;
      t1.form.push('NR');

      t2.played += 1;
      t2.noResult += 1;
      t2.points += pointsForNoResult;
      t2.form.push('NR');
      return;
    }

    if (m.status === 'completed' && m.innings1 && m.innings2) {
      t1.played += 1;
      t2.played += 1;

      const inn1 = m.innings1;
      const inn2 = m.innings2;

      // Determine batting & bowling team for each innings
      const team1BatFirst = inn1.battingTeamId === m.team1Id;
      const innTeam1Bat = team1BatFirst ? inn1 : inn2;
      const innTeam2Bat = team1BatFirst ? inn2 : inn1;

      // Calculate overs faced for Team 1 (if all out, full quota applies)
      let t1OversFaced = oversToDecimal(innTeam1Bat.overs, innTeam1Bat.balls);
      if (innTeam1Bat.wickets >= 10) {
        t1OversFaced = m.overs;
      }

      // Calculate overs faced for Team 2 (if all out, full quota applies)
      let t2OversFaced = oversToDecimal(innTeam2Bat.overs, innTeam2Bat.balls);
      if (innTeam2Bat.wickets >= 10) {
        t2OversFaced = m.overs;
      }

      t1.runsScored += innTeam1Bat.totalRuns;
      t1.oversFacedDecimal += t1OversFaced;
      t1.runsConceded += innTeam2Bat.totalRuns;
      t1.oversBowledDecimal += t2OversFaced;

      t2.runsScored += innTeam2Bat.totalRuns;
      t2.oversFacedDecimal += t2OversFaced;
      t2.runsConceded += innTeam1Bat.totalRuns;
      t2.oversBowledDecimal += t1OversFaced;

      // Winner determination
      if (m.winnerTeamId === m.team1Id) {
        t1.won += 1;
        t1.points += pointsForWin;
        t1.form.push('W');
        t2.lost += 1;
        t2.form.push('L');
      } else if (m.winnerTeamId === m.team2Id) {
        t2.won += 1;
        t2.points += pointsForWin;
        t2.form.push('W');
        t1.lost += 1;
        t1.form.push('L');
      } else {
        // Tied
        t1.tied += 1;
        t1.points += pointsForTie;
        t1.form.push('T');
        t2.tied += 1;
        t2.points += pointsForTie;
        t2.form.push('T');
      }
    }
  });

  const result: StandingsRow[] = Object.values(standingsMap).map((item) => {
    const batRate = item.oversFacedDecimal > 0 ? item.runsScored / item.oversFacedDecimal : 0;
    const bowlRate = item.oversBowledDecimal > 0 ? item.runsConceded / item.oversBowledDecimal : 0;
    const nrr = Number((batRate - bowlRate).toFixed(3));

    return {
      teamId: item.team.id,
      teamName: item.team.name,
      teamShort: item.team.shortName,
      teamLogo: item.team.logo,
      teamColor: item.team.primaryColor,
      played: item.played,
      won: item.won,
      lost: item.lost,
      tied: item.tied,
      noResult: item.noResult,
      points: item.points,
      runsScored: item.runsScored,
      oversFaced: Number(item.oversFacedDecimal.toFixed(1)),
      runsConceded: item.runsConceded,
      oversBowled: Number(item.oversBowledDecimal.toFixed(1)),
      netRunRate: nrr,
      form: item.form.slice(-5), // last 5 matches
    };
  });

  // Sort by Points (descending), then Net Run Rate (descending), then Wins
  return result.sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.netRunRate !== a.netRunRate) return b.netRunRate - a.netRunRate;
    return b.won - a.won;
  });
}
