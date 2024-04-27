import { APIEmbedField, EmbedBuilder } from "discord.js";
import { getLiveBoxScores } from "../data/BDL/endpoints/boxscores/liveBoxScores";
import IGame from "../interfaces/IGame";
import IResult from "../interfaces/IResult";
import { extractTimeIfUtc } from "../utils/extractTimeIfUtc";
import { extractBoxScoreData } from "./extractBoxScoreData";
import { IBoxScorePlayer, IBoxScoreStats } from "../interfaces/IBoxScore";
import { findTopPerformers } from "./Impactfulness";
import { formatPlayerStats } from "./formatBoxScores";
import { getGameStats } from "../utils/getGameStats";

export async function checkGameIsFinal(game: IGame): Promise<IResult> {
  console.log("Checking for if the game has finalized...");

  //   console.log(`Game Status in checkGameIsFinal: ${game.status}`);

  // Check if the game is already finalized and missed due to null game.time
  if (game.status === "Final") {
    const eventDescription = `**Final Score:** ${game.home_team_score} - ${game.visitor_team_score}`;
    const eventId = "Game Has Ended";

    // console.log(
    //   `EventDescription set: ${eventDescription} || eventId set: ${eventId}`
    // );

    // Fetch live box scores
    const liveBoxScores = await getLiveBoxScores();

    if (!liveBoxScores) {
      console.error("No live box scores found");
      return { occurred: false };
    }

    const boxScores = await extractBoxScoreData(liveBoxScores, game);

    // Initialize embed
    const embed = new EmbedBuilder()
      .setColor("#0099ff")
      .setTitle(eventId)
      .setTimestamp();

    if (eventDescription && eventDescription !== "") {
      if (Array.isArray(boxScores)) {
        const allHomePlayers = [...boxScores[0]];
        const allVisitorPlayers = [...boxScores[1]];
        const allPlayers = [...allHomePlayers, ...allVisitorPlayers];
        const gameStats = getGameStats(allPlayers);
        const topHomePerformers = findTopPerformers(
          allHomePlayers,
          gameStats,
          3
        );
        const topVisitorPerformers = findTopPerformers(
          allVisitorPlayers,
          gameStats,
          3
        );
        const homeTeamField: APIEmbedField = {
          name: "Home Team",
          value: topHomePerformers.map(formatPlayerStats).join("\n\n"),
          inline: true,
        };
        const visitorTeamField: APIEmbedField = {
          name: "Visitor Team",
          value: topVisitorPerformers.map(formatPlayerStats).join("\n\n"),
          inline: true,
        };

        embed.setDescription(eventDescription);
        embed.setTitle(
          `${game.home_team.name} vs ${game.visitor_team.name} has ended.`
        );
        // console.log(`Embed description set.`);

        // Display box score data in embed
        embed.addFields(homeTeamField, visitorTeamField);
        // console.log(`Embed Fields set.`);
        return { occurred: true, eventDescription, eventId, embed };
      } else {
        // console.error("Error fetching box scores:", boxScores);
      }
    }
  }
  return { occurred: false };
}
