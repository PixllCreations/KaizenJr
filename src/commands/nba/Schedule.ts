// src/commands/GetSchedule.ts
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import ScheduleCommandGroup from "./Schedule/ScheduleCommandGroup";
import Category from "../../base/enums/Category";
import CommandTypes from "../../base/enums/CommandType";

export default class Schedule extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "schedule",
      description: "Get NBA content.",
      type: CommandTypes.Command,
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      category: Category.Nba,
      cooldown: 5,
      dm_permission: false,
      dev: false,
      deprecated: false,
      options: [
        {
          name: "get",
          description: "Get a 7 day schedule of the NBA.",
          type: ApplicationCommandOptionType.SubcommandGroup,
          options: new ScheduleCommandGroup(client).options,
        },
      ],
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    // Delegation to subcommand groups or subcommands
    const subCommandGroup = interaction.options.getSubcommandGroup(false);
    if (subCommandGroup === "get") {
      await new ScheduleCommandGroup(this.client).Execute(interaction);
    }
  }
}
