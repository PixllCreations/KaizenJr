import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { cacheTeamId } from "../../modules/nba/utils/cacheTeamId";
import { getGames } from "../../modules/nba/endpoints";

export default class GetSchedule extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "get",
      description: "Get NBA content.",
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      category: Category.Nba,
      cooldown: 5,
      dm_permission: false,
      dev: false,
      deprecated: false,
      options: [
        {
          name: "schedule",
          description: "Get a 7 day schedule of the NBA.",
          type: ApplicationCommandOptionType.SubcommandGroup,
          options: [
            {
              name: "byTeamID",
              description: "Specify a team to filter the schedule.",
              required: false,
              type: ApplicationCommandOptionType.String,
              options: [],
            },
            {
              name: "byDate",
              description:
                "Specify a specific date (YYYY-MM-DD) to filter the schedule.",
              required: false,
              type: ApplicationCommandOptionType.Subcommand,
              options: [],
            },
            {
              name: "byDates",
              description:
                "Specify a start and end date (YYYY-MM-DD) to filter the schedule",
              required: false,
              type: ApplicationCommandOptionType.Subcommand,
              options: [
                {
                  name: "start",
                  description:
                    "Provide the starting date you'd like to fetch games for.",
                  required: true,
                  type: ApplicationCommandOptionType.String,
                },
                {
                  name: "end",
                  description:
                    "Provide the ending date you'd like to fetch games for. ",
                  required: true,
                  type: ApplicationCommandOptionType.String,
                },
              ],
            },
          ],
        },
      ],
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: false });
    const teamName = interaction.options.getString("team");
    let date = interaction.options.getString("date");
    const datesOption =
      interaction.options.getSubcommandGroup(false) === "dates";

    let teamId;
    if (teamName) {
      let fetchedTeamId = await cacheTeamId(teamName);
      if (fetchedTeamId) {
        teamId = parseInt(fetchedTeamId, 10);
        if (isNaN(teamId)) {
          await interaction.editReply(
            `Team not found or invalid ID: ${teamName}`
          );
          return;
        }
      } else {
        await interaction.editReply(`Team not found: ${teamName}`);
        return;
      }
    }

    // Logic for handling date ranges if the 'dates' subcommand is used
    let startDate, endDate;
    if (datesOption) {
      startDate = interaction.options.getString("start", true); // 'true' for required options
      endDate = interaction.options.getString("end", true);
    }

    // Logic for defaulting to next 7 days if no specific date or range is provided
    if (!date && !datesOption) {
      const today = new Date();
      date = today.toISOString().split("T")[0];
      const endDateObj = new Date();
      endDateObj.setDate(today.getDate() + 7);
      endDate = endDateObj.toISOString().split("T")[0];
    }

    // Preparing options for the schedule fetching function
    const options = {
      ...(teamId !== undefined && { team_ids: [teamId] }),
      ...(date && { dates: [date] }),
      ...(startDate && endDate && { start_date: startDate, end_date: endDate }),
    };

    const schedule = await getGames(options); // Adjust this to your actual function that fetches the schedule

    // Construct and send the embed with fetched data
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("NBA Schedule")
      .setDescription(
        teamName ? `Schedule for ${teamName}` : "Upcoming NBA games"
      );

    await interaction.editReply({ embeds: [embed] });
  }
}
