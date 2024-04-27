import { APIEmbedField, EmbedBuilder } from "discord.js";
import { getLiveBoxScores } from "../data/BDL/endpoints/boxscores/liveBoxScores";
import IGame from "../interfaces/IGame";
import { extractTimeIfUtc } from "../utils/extractTimeIfUtc";
import { extractBoxScoreData } from "./extractBoxScoreData";
import IResult from "../interfaces/IResult";
import { formatPlayerStats } from "./formatBoxScores";
import { findTopPerformers } from "./Impactfulness";
import { getGameStats } from "../utils/getGameStats";

export async function checkCloseGame(game: IGame): Promise<IResult> {
  const statusData = extractTimeIfUtc(game.status);
  console.log(statusData);
  console.log(`Status data: ${statusData}`);

  console.log("Checking for game events...");

  try {
    if (!statusData || statusData === null) {
      // Fetch live box scores
      const liveBoxScores = await getLiveBoxScores();

      if (!liveBoxScores) {
        console.error("No live box scores found");
        return { occurred: false };
      }

      const boxScores = await extractBoxScoreData(liveBoxScores, game);

      // Initialize embed
      const embed = new EmbedBuilder().setColor("#0099ff").setTimestamp();

      let eventDescription;
      let eventId;

      const timeMatch = game.time
        ? game.time.match(/Q(\d+) (\d+):(\d+)/)
        : null;
      console.log(`timeMatch Boolean: ${timeMatch}`);

      if (!timeMatch) {
        console.log(
          "Time format is incorrect or missing, skipping time check."
        );
        return { occurred: false };
      }

      const quarter = parseInt(timeMatch[1], 10);
      const minutes = parseInt(timeMatch[2], 10);
      const seconds = parseInt(timeMatch[3], 10);
      console.log(
        `Time check: quarter ${quarter}, ${minutes}:${seconds} time remaining`
      );
      const scoreDiff = Math.abs(
        game.home_team_score - game.visitor_team_score
      );

      console.log(`${minutes}:${seconds}`);
      console.log(`Score difference: ${scoreDiff}`);

      // Check if the time is between 5:00 and 0:00 and the score difference is 25 or less
      if (
        (quarter === 4 && minutes < 5) ||
        (minutes === 5 && seconds === 0 && scoreDiff <= 40)
      ) {
        console.log(
          "Triggering close game event with less than 5 minutes left"
        );
        eventDescription = `**Game is ${
          scoreDiff === 0 ? `tied` : `close!`
        } Score: ${game.home_team_score} - ${
          game.visitor_team_score
        } with ${minutes}:${seconds} left in the 4th **`;
        eventId = "Close with 5";
      }

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
            `${game.home_team.name} vs ${game.visitor_team.name} is close!.`
          );
          console.log(`Embed description set.`);

          // Display box score data in embed
          embed.addFields(homeTeamField, visitorTeamField);
          console.log(`Embed Fields set.`);
          return { occurred: true, eventDescription, eventId, embed };
        }
      }
    }
  } catch (error) {
    console.error(`Error processing close game for game ${game.id}: ${error}`);
    return { occurred: false };
  }
  return { occurred: false };
}
