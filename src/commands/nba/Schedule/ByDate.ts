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
import { buildGameScheduleEmbed } from "../../../modules/nba/utils/redisUtils/buildScheduleEmbed";

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

    if (!date) {
      date = getLocalDate();
    }
    console.log(date);

    const games = (await getGames({ dates: [date] })).data;
    console.log(games);

    const embed = await buildGameScheduleEmbed(games, date);

    await respondToInteraction(interaction, embed);
  }
}
