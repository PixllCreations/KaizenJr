// src/commands/GetSchedule.ts
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
  PermissionsBitField,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import CommandTypes from "../../base/enums/CommandType";
import TeamEmoteCommandGroup from "./Team Emotes/EmoteCommandGroup";

export default class GetSchedule extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "team",
      description: "NBA team related commands.",
      type: CommandTypes.Command,
      default_member_permissions: PermissionsBitField.Flags.SendMessages,
      category: Category.Developer,
      cooldown: 2,
      dm_permission: false,
      dev: true,
      deprecated: false,
      options: [
        {
          name: "emote",
          description: "Team emote related commands.",
          type: ApplicationCommandOptionType.SubcommandGroup,
          options: new TeamEmoteCommandGroup(client).options,
        },
      ],
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    // Delegation to subcommand groups or subcommands
    const subCommandGroup = interaction.options.getSubcommandGroup(false);
    if (subCommandGroup === "emote") {
      await new TeamEmoteCommandGroup(this.client).Execute(interaction);
    }
  }
}
