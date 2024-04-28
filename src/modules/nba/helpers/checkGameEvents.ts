import { APIEmbedField, EmbedBuilder } from "discord.js";
import { getLiveBoxScores } from "../data/BDL/endpoints/boxscores/liveBoxScores";
import IGame from "../interfaces/IGame";
import { extractTimeIfUtc } from "../utils/extractTimeIfUtc";
import { extractBoxScoreData } from "./extractBoxScoreData";
import IResult from "../interfaces/IResult";
import { getGameStats } from "../utils/getGameStats";
import { findTopPerformers } from "./Impactfulness";
import { formatPlayerStats } from "./formatBoxScores";
import { getTeamEmote } from "../utils/redisUtils/teamEmotes";
import redisClient from "../../../config/redisClient";

export async function checkGameEvents(game: IGame): Promise<IResult> {
  const timeData = extractTimeIfUtc(game.status);
  console.log(timeData);
  console.log(`Time data: ${timeData}`);

  console.log("Checking for game events...");

  if (!timeData || timeData === null) {
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

    const homeTeamIcon = await getTeamEmote(redisClient, game.home_team.id);

    const awayTeamIcon = await getTeamEmote(redisClient, game.visitor_team.id);

    const commonDescript = `${game.home_team.full_name}   ${homeTeamIcon}   vs   ${awayTeamIcon}   ${game.visitor_team.full_name}`;

    // Check for end of each quarter or halftime
    switch (game.time) {
      case "END Q1":
        eventDescription = `${commonDescript} \n End of 1st Quarter \n Score: ${game.home_team_score} - ${game.visitor_team_score}`;
        eventId = "End of 1st Quarter";
        break;
      case "Half":
        eventDescription = `${commonDescript} \n Halftime \n Score: ${game.home_team_score} - ${game.visitor_team_score}`;
        eventId = "Halftime";
        break;
      case "END Q3":
        eventDescription = `${commonDescript} \n End of 3rd Quarter \n Score: ${game.home_team_score} - ${game.visitor_team_score}`;
        eventId = "End of 3rd Quarter";
        break;
      case "END Q4":
        eventDescription = `${commonDescript} \n End of 4th Quarter. \n Final Score: ${game.home_team_score} - ${game.visitor_team_score}`;
        eventId = "END Q4";
        break;
      case "OT":
        eventDescription = `${commonDescript} \n End of 4th Quarter \n Score: ${game.home_team_score} - ${game.visitor_team_score}`;
        eventId = "End of 4th Quarter";
        break;
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
          name: `${homeTeamIcon}  Home Team`,
          value: topHomePerformers.map(formatPlayerStats).join("\n\n"),
          inline: true,
        };
        const visitorTeamField: APIEmbedField = {
          name: `${awayTeamIcon}  Visitor Team`,
          value: topVisitorPerformers.map(formatPlayerStats).join("\n\n"),
          inline: true,
        };

        if (eventId) {
          embed.setTitle(eventId);
          embed.setDescription(eventDescription);

          // Display box score data in embed
          embed.addFields(homeTeamField, visitorTeamField);
          return { occurred: true, eventDescription, eventId, embed };
        } else {
          console.error("Error fetching box scores:", boxScores);
        }
      }
    }
  }
  return { occurred: false };
}
