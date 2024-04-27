import {
  ApplicationCommandOptionType,
  ApplicationCommandOptionWithChoicesAndAutocompleteMixin,
  ChatInputCommandInteraction,
  EmbedBuilder,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { initTeams } from "../../modules/nba/helpers/initTeams";
import divisions from "../../modules/nba/data/divisions.json";

export default class Init extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "init",
      description: "Initialize data sets.",
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      category: Category.Nba,
      cooldown: 5,
      dm_permission: false,
      dev: true,
      deprecated: false,
      options: [
        {
          name: "teams",
          description: "Initialize NBA Teams to database.",
          type: ApplicationCommandOptionType.Subcommand,
          options: [
            {
              name: "conference",
              description: "Specify the conference to initialize.",
              required: false,
              type: ApplicationCommandOptionType.String,
              choices: [
                {
                  name: "East",
                  value: "east",
                },
                {
                  name: "West",
                  value: "west",
                },
              ],
            },
            {
              name: "division",
              description: "Specify the division to intiialize",
              required: false,
              type: ApplicationCommandOptionType.String,
              choices: divisions,
            },
          ],
        },
      ],
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });
    const subCommand = interaction.options.getSubcommand();

    if (subCommand === "teams") {
      const conference =
        interaction.options.getString("conference") ?? undefined;
      const division = interaction.options.getString("division") ?? undefined;

      try {
        // Call updateDatabase with the conference and division, if provided
        await initTeams(conference, division);
        await interaction.editReply(
          "NBA teams have been successfully initialized/updated in the database."
        );
      } catch (error) {
        console.error("Failed to initialize/update NBA teams:", error);
        await interaction.editReply(
          "There was an error initializing/updating NBA teams in the database."
        );
      }
    }
  }
}
