import { IBoxScoreStats } from "../interfaces/IBoxScore";

// Function to sum up all player stats for a game
export function getGameStats(playerStats: IBoxScoreStats[]): IBoxScoreStats {
  const gameStats: IBoxScoreStats = {
    player: {
      id: 0,
      first_name: "Team",
      last_name: "Total",
      position: "",
      height: "",
      weight: "",
      jersey_number: "",
    },
    pts: 0,
    min: "00",
    ast: 0,
    turnover: 0,
    stl: 0,
    blk: 0,
    pf: 0,
    fgm: 0,
    fga: 0,
    fg_pct: 0,
    fg3m: 0,
    fg3a: 0,
    fg3_pct: 0,
    ftm: 0,
    fta: 0,
    ft_pct: 0,
    oreb: 0,
    dreb: 0,
    reb: 0,
  };

  for (const stats of playerStats) {
    gameStats.pts += stats.pts;
    gameStats.ast += stats.ast;
    gameStats.turnover += stats.turnover;
    gameStats.stl += stats.stl;
    gameStats.blk += stats.blk;
    gameStats.pf += stats.pf;
    gameStats.fgm += stats.fgm;
    gameStats.fga += stats.fga;
    gameStats.fg3m += stats.fg3m;
    gameStats.fg3a += stats.fg3a;
    gameStats.ftm += stats.ftm;
    gameStats.fta += stats.fta;
    gameStats.oreb += stats.oreb;
    gameStats.dreb += stats.dreb;
    gameStats.reb += stats.reb;
  }

  // Calculate percentages after all values are aggregated
  gameStats.fg_pct =
    gameStats.fga > 0 ? (gameStats.fgm / gameStats.fga) * 100 : 0;
  gameStats.fg3_pct =
    gameStats.fg3a > 0 ? (gameStats.fg3m / gameStats.fg3a) * 100 : 0;
  gameStats.ft_pct =
    gameStats.fta > 0 ? (gameStats.ftm / gameStats.fta) * 100 : 0;

  return gameStats;
}
