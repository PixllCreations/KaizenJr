// src/commands/subcommands/ByDate.ts
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/SubCommand";
import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import { getGames } from "../../../modules/nba/data/BDL/endpoints";
import { respondToInteraction } from "../../../base/functions/respondToInteraction";
import { getStreams } from "../../../modules/nba/data/SportsDB/endpoints/getStreams";
import { getEventId } from "../../../modules/nba/data/SportsDB/endpoints/getEventId";
import CommandTypes from "../../../base/enums/CommandType";
import { getLocalDate } from "../../../base/functions/getLocalDate";
import { getTeamEmote } from "../../../modules/nba/utils/redisUtils/teamEmotes";
import redisClient from "../../../config/redisClient";

export default class ByDate extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "by_date",
      description: "Filter the schedule by a single date (YYYY-MM-DD).",
      type: CommandTypes.SubCommand,
      options: [
        {
          name: "date",
          description:
            "Specify a specific date (YYYY-MM-DD) to filter the schedule.",
          required: false,
          type: ApplicationCommandOptionType.String,
        },
      ],
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    let date = interaction.options.getString("date", false);
    const uniqueStreams = new Map();

    if (!date) {
      date = getLocalDate();
    }
    console.log(date);

    const games = (await getGames({ dates: [date] })).data;
    console.log(games);

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
      const homeTeamIcon = await getTeamEmote(redisClient, game.home_team.id);

      const awayTeamIcon = await getTeamEmote(
        redisClient,
        game.visitor_team.id
      );

      const gameTitle = `${game.home_team.name}   ${homeTeamIcon}   VS   ${awayTeamIcon}   ${game.visitor_team.name}`; // Matchup
      const idEvent = await getEventId(
        game.home_team.full_name,
        game.visitor_team.full_name,
        date
      );
      // Fetch streams
      const streams = await getStreams(idEvent); // Assuming each game object has an idEvent field

      // console.log(streams);

      let streamsField = streams.map((stream) => `${stream.emote}`).join(", ");
      streamsField =
        streams.length > 0
          ? `Streams: ${streamsField}`
          : "No streams available";

      streams.forEach((stream) => {
        if (!uniqueStreams.has(stream.name)) {
          uniqueStreams.set(stream.name, stream);
        }
      });

      let gameDetail = "Details not available";
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

    const components = [];

    // Create buttons for unique streams
    const row = new ActionRowBuilder<ButtonBuilder>();
    uniqueStreams.forEach((stream) => {
      const button = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(stream.displayName)
        .setURL(stream.link)
        .setEmoji(stream.emote);
      row.addComponents(button);
    });

    if (row.components.length > 0) {
      components.push(row);
    }

    console.log(row);
    console.log(components.length);
    await respondToInteraction(interaction, {
      embeds: [embed],
      components: components.length > 0 ? components : undefined,
    });
  }
}
