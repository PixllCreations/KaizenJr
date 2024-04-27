import { IBoxScoreStats } from "../interfaces/IBoxScore";

// Function to format player stats for a team
export function formatPlayerStats(playerStats: IBoxScoreStats) {
  return (
    `**${playerStats.player.first_name} ${playerStats.player.last_name} (${playerStats.player.position})**\n` +
    `Min: ${playerStats.min} \n FG: ${playerStats.fgm}-${playerStats.fga} (${playerStats.fg_pct}) \n ` +
    `3PT: ${playerStats.fg3m}-${playerStats.fg3a} (${playerStats.fg3_pct}) \n FT: ${playerStats.ftm}-${playerStats.fta} (${playerStats.ft_pct}) \n` +
    `REB: ${playerStats.reb} \n AST: ${playerStats.ast} \n STL: ${playerStats.stl} \n BLK: ${playerStats.blk} \n ` +
    `TO: ${playerStats.turnover} \n PF: ${playerStats.pf} \n PTS: ${playerStats.pts}`
  );
}
