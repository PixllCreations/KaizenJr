import { IBoxScoreStats } from "../interfaces/IBoxScore";

// Function to format player stats for a team
export function formatPlayerStats(playerStats: IBoxScoreStats) {
  return (
    `**${playerStats.player.first_name} ${playerStats.player.last_name} (${playerStats.player.position})**\n` +
    `Min: ${playerStats.min} \n FG: ${playerStats.fgm}-${playerStats.fga} (${(
      playerStats.fg_pct * 100
    ).toFixed(0)}%) \n ` +
    `3PT: ${playerStats.fg3m}-${playerStats.fg3a} (${(
      playerStats.fg3_pct * 100
    ).toFixed(0)}%) \n FT: ${playerStats.ftm}-${playerStats.fta} (${(
      playerStats.ft_pct * 100
    ).toFixed(0)}%) \n` +
    `REB: ${playerStats.reb} \n AST: ${playerStats.ast} \n STL: ${playerStats.stl} \n BLK: ${playerStats.blk} \n ` +
    `TO: ${playerStats.turnover} \n PF: ${playerStats.pf} \n PTS: ${playerStats.pts}`
  );
}
