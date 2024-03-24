import {
  ChatInputCommandInteraction,
  PermissionsBitField,
  GuildMember,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { syncTempChannels } from "../../base/functions/syncTempChannels";

/**
 * Command class for synchronizing and deleting empty temporary channels across all guilds.
 * This command is restricted to users with the Manage Guild permission.
 */

export default class SyncTempChannels extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "synctempchannels",
      description: "Sync and delete empty temporary channels across all guilds",
      category: Category.Utility,
      options: [],
      default_member_permissions: PermissionsBitField.Flags.ManageGuild,
      cooldown: 5,
      dm_permission: false,
      dev: true,
    });
  }

  /**
   * Executes the command to sync and delete empty temporary channels.
   * @param {ChatInputCommandInteraction} interaction - The command interaction.
   */
  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Ensure the command is used within a guild and the user is a GuildMember
    if (
      !interaction.inGuild() ||
      !(interaction.member instanceof GuildMember)
    ) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    // Defer the reply to ensure a quicker response
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply(
      "Initiating manual refresh of Temporary channels..."
    );

    try {
      // Call the syncTempChannels function to synchronize and delete empty temporary channels
      await syncTempChannels(this.client);
      await interaction.editReply({
        content: "All empty temporary channels have been deleted.",
      });
    } catch (error) {
      console.error("Error during SyncTempChannels command execution:", error);
      await interaction.editReply({
        content: "An error occurred while executing the command.",
      });
    }
  }
}
