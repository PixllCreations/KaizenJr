import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { syncLogChannels } from "../../base/functions/syncLogChannel";

/**
 * Command class for syncing the server logs channel for each guild.
 * This command is restricted to users with the Manage Guild permission.
 */

export default class SyncLogChannel extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "synclogs",
      description: "Sync the server logs channel for each guild.",
      category: Category.Utility,
      options: [],
      default_member_permissions: PermissionsBitField.Flags.ManageGuild,
      cooldown: 5,
      dm_permission: false,
      dev: false,
      deprecated: false,
    });
  }

  /**
   * Executes the command to sync the server logs channel for each guild.
   * @param {ChatInputCommandInteraction} interaction - The command interaction.
   */

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Defer the reply to ensure a quicker response
    await interaction.deferReply({ ephemeral: true });

    try {
      // Call the syncLogChannels function to sync the log channels across all guilds
      await syncLogChannels(this.client);
      await interaction.editReply(
        "The log channels across all guilds have been synced successfully."
      );
    } catch (error) {
      console.error("Error syncing the log channels:", error);
      await interaction.editReply(
        "There was an error while syncing the log channels. Please try again later."
      );
    }
  }
}
