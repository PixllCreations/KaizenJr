import { IBoxScoreStats } from "../interfaces/IBoxScore";
import { getGameStats } from "../utils/getGameStats";

export function calculateImpact(
  playerStats: IBoxScoreStats,
  gameStats: IBoxScoreStats
): number {
  const individualScore =
    playerStats.pts +
    playerStats.fgm +
    playerStats.ftm -
    playerStats.fga -
    playerStats.fta +
    playerStats.dreb +
    0.5 * playerStats.oreb +
    playerStats.ast +
    playerStats.stl +
    0.5 * playerStats.blk -
    playerStats.pf -
    playerStats.turnover;

  const gameScore =
    gameStats.pts +
    gameStats.fgm +
    gameStats.ftm -
    gameStats.fga -
    gameStats.fta +
    gameStats.dreb +
    0.5 * gameStats.oreb +
    gameStats.ast +
    gameStats.stl +
    0.5 * gameStats.blk -
    gameStats.pf -
    gameStats.turnover;

  return gameScore !== 0 ? individualScore / gameScore : 0;
}

export function findTopPerformers(
  playerStats: IBoxScoreStats[],
  gameStats: IBoxScoreStats,
  count: number
) {
  const playerScores = playerStats.map((player: IBoxScoreStats) => {
    const impactfulness = calculateImpact(player, gameStats);
    // console.log(
    //   `Player: ${player.player.first_name} ${player.player.last_name}`
    // );
    // console.log(`Impactfulness Score: ${impactfulness}`);
    return {
      player,
      impactfulness,
    };
  });

  // Sort players based on impactfulness score
  const sortedPlayers = playerScores.sort(
    (a, b) => b.impactfulness - a.impactfulness
  );

  // Select the top 'count' performers
  const topPerformers = sortedPlayers.slice(0, count);

  return topPerformers.map((performer) => performer.player);
}

export function buildBoxscoreField(boxScores: IBoxScoreStats[][]) {
  const allHomePlayers = [...boxScores[0]];
  const allVisitorPlayers = [...boxScores[1]];
  const allPlayers = [...allHomePlayers, ...allVisitorPlayers];
  const gameStats = getGameStats(allPlayers);
  const home = findTopPerformers(allHomePlayers, gameStats, 3);
  const away = findTopPerformers(allVisitorPlayers, gameStats, 3);

  return { home, away };
}
