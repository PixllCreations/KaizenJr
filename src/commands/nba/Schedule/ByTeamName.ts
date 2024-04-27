// src/commands/subcommands/ByTeamName.ts
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/SubCommand";
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import { getTeamId } from "../../../modules/nba/utils/getTeamId";
import { respondToInteraction } from "../../../base/functions/respondToInteraction";
import { getGames } from "../../../modules/nba/data/BDL/endpoints";
import { getEventId } from "../../../modules/nba/data/SportsDB/endpoints/getEventId";
import { getStreams } from "../../../modules/nba/data/SportsDB/endpoints/getStreams";
import CommandTypes from "../../../base/enums/CommandType";

export default class ByTeamName extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "by_team_name",
      description: "Filter the schedule by team name.",
      type: CommandTypes.SubCommand,
      options: [
        {
          name: "name",
          description: "Specify a team to filter the schedule by.",
          required: false,
          type: ApplicationCommandOptionType.String,
        },
      ],
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const teamName = interaction.options.getString("name");

    let teamId;
    if (teamName) {
      let fetchedTeamId = await getTeamId(teamName);
      if (fetchedTeamId) {
        teamId = parseInt(fetchedTeamId, 10);
        if (isNaN(teamId)) {
          await respondToInteraction(
            interaction,
            `Team not found or invalid ID: ${teamName}`
          );
          return;
        }
      } else {
        await respondToInteraction(interaction, `Team not found: ${teamName}`);
        return;
      }

      const options: {
        start_date?: string;
        end_date?: string;
        dates?: string[];
        team_ids?: number[];
      } = {};

      if (teamId !== undefined) {
        options.team_ids = [teamId];
      }

      const today = new Date().toISOString().split("T")[0];
      options.start_date = today;
      options.end_date = today;

      const schedule = await getGames(options);
      const games = schedule.data;
      console.log("Games: ", games);

      const nbaBadge = "<:frdjqy1536585083:1231513139116376096>";

      const embed = new EmbedBuilder()
        .setColor(0x0099ff) // Set a theme color
        .setTitle(`${nbaBadge} Game Schedule`)
        .setThumbnail(
          "https://imgtr.ee/images/2024/04/21/cbbadb96b21198dcea032c9123ec76d6.png"
        )
        .setFooter({
          text: `The time is shown in your local timezone.`,
        });

      embed.addFields({ name: "\u00A0", value: "\u00A0", inline: false });

      // Iterate over each game to add details
      for (const game of games) {
        const gameTitle = `${game.home_team.name} vs ${game.visitor_team.name}`; // Matchup
        let gameDetail;

        const idEvent = await getEventId(game.home_team, game.awayTeam, today);

        // Fetch streams
        const streams = await getStreams(idEvent); // Assuming each game object has an idEvent field
        let streamsField =
          streams.length > 0
            ? `Streams: ${streams.join(", ")}`
            : "No streams available";

        // Determine what to display based on the game status
        if (game.period === 0 && game.time === null) {
          // Convert the ISO date-time to a Unix timestamp for Discord's auto local timestamp feature
          const unixStartTime = Math.floor(
            new Date(game.status).getTime() / 1000
          );
          gameDetail = `Start Time: <t:${unixStartTime}:t> (<t:${unixStartTime}:R>)`;
        } else if (game.status === "Final") {
          gameDetail = `Final Score: ${game.home_team_score} - ${game.visitor_team_score}`;
        } else {
          // Handle other cases such as during the game
          const timeRemaining = game.time
            ? `Time Left: ${game.time}`
            : `In Progress`;
          gameDetail = `${game.status} - ${timeRemaining}\nScore: ${game.home_team_score} - ${game.visitor_team_score}`;
        }

        embed.addFields({
          name: `${gameTitle}`,
          value: `${gameDetail}\n${streamsField}`,
          inline: false,
        });
        // Add a spacing field
        embed.addFields({ name: "\u00A0", value: "\u00A0", inline: false });
      }

      await respondToInteraction(interaction, { embeds: [embed] });
    }
  }
}
