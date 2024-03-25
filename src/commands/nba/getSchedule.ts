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
import IGame from "../../modules/nba/interfaces/IGame";

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
              name: "by_team_name",
              description: "Filter the schedule by team name.",
              required: false,
              type: ApplicationCommandOptionType.Subcommand,
              options: [
                {
                  name: "name",
                  description: "Specify a team to filter the schedule by.",
                  required: false,
                  type: ApplicationCommandOptionType.String,
                },
              ],
            },
            {
              name: "by_date",
              description: "Filter the schedule by a single date (YYYY-MM-DD).",
              required: false,
              type: ApplicationCommandOptionType.Subcommand,
              options: [
                {
                  name: "date",
                  description:
                    "Specify a specific date (YYYY-MM-DD) to filter the schedule.",
                  required: false,
                  type: ApplicationCommandOptionType.String,
                },
              ],
            },
            {
              name: "by_dates",
              description:
                "Specify a start and end date (YYYY-MM-DD) to filter the schedule",
              required: false,
              type: ApplicationCommandOptionType.Subcommand,
              options: [
                {
                  name: "start",
                  description:
                    "Provide the starting date you'd like to fetch games for.",
                  required: false,
                  type: ApplicationCommandOptionType.String,
                },
                {
                  name: "end",
                  description:
                    "Provide the ending date you'd like to fetch games for. ",
                  required: false,
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
    const teamName = interaction.options.getString("name");
    let date = interaction.options.getString("date");
    const datesOption = interaction.options.getSubcommandGroup(false) === "schedule";
  
    let teamId;
    if (teamName) {
      let fetchedTeamId = await cacheTeamId(teamName);
      if (fetchedTeamId) {
        teamId = parseInt(fetchedTeamId, 10);
        if (isNaN(teamId)) {
          await interaction.editReply(`Team not found or invalid ID: ${teamName}`);
          return;
        }
      } else {
        await interaction.editReply(`Team not found: ${teamName}`);
        return;
      }
    }
  
    let startDate, endDate;
    if (datesOption) {
      startDate = interaction.options.getString("start", true);
      endDate = interaction.options.getString("end", true);
    }
  
    if (!date && !datesOption) {
      const today = new Date();
      date = today.toISOString().split("T")[0];
      const endDateObj = new Date();
      endDateObj.setDate(today.getDate() + 7);
      endDate = endDateObj.toISOString().split("T")[0];
    }
  
    const options = {
      ...(teamId !== undefined && { team_ids: [teamId] }),
      ...(date && { dates: [date] }),
      ...(startDate && endDate && { start_date: startDate, end_date: endDate }),
    };
  
    const schedule = await getGames(options);
    const games = schedule.data;
  
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle("NBA Schedule")
      .setDescription(teamName ? `Schedule for ${teamName}` : "Upcoming NBA games");
  
    // Add each game to the embed as a field
    games.forEach((game: IGame) => {
      const gameDate = new Date(game.date).toLocaleDateString("en-US");
      const gameTime = new Date(game.date).toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit' });
      const gameTitle = `${game.home_team.name} vs ${game.visitor_team.name}`;
      const gameDetail = `${gameDate} at ${gameTime}`;
  
      embed.addFields({ name: gameTitle, value: gameDetail, inline: true });
    });
  
    await interaction.editReply({ embeds: [embed] });
  }
}  
