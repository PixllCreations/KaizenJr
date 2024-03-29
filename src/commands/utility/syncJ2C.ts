import {
  ChatInputCommandInteraction,
  PermissionsBitField,
  GuildMember,
} from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { initializeDatabaseWithGuildsAndJ2CChannels } from "../../base/functions/initializeDatabase";

/**
 * Command class for manually refreshing J2C channels in all guilds.
 * This command is restricted to users with the Manage Guild permission.
 */

export default class SyncJ2CChannels extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "syncj2c",
      description: "Manually refresh J2C channels in all guilds",
      category: Category.Utility,
      options: [],
      default_member_permissions: PermissionsBitField.Flags.ManageGuild,
      cooldown: 5,
      dm_permission: false,
      dev: false,
      deprecated: true,
    });
  }

  /**
   * Executes the command to manually refresh J2C channels in all guilds.
   * @param {ChatInputCommandInteraction} interaction - The command interaction.
   */

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Server Manager in Dev Guilford role ID for TESTING
    const allowedRoleId = "1208631536077770782";
    // Community & Backend Ops role ID
    // const allowedRoleId = "1121919156216922204";

    // Check if the interaction is in a guild and the member is a GuildMember
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

    // Check if the member has the allowed role
    const memberHasRole = interaction.member.roles.cache.has(allowedRoleId);
    if (!memberHasRole) {
      await interaction.reply({
        content: "You do not have permission to use this command.",
        ephemeral: true,
      });
      return;
    }

    // Defer the reply to ensure a quicker response
    await interaction.deferReply({ ephemeral: true });
    await interaction.editReply("Initiating manual refresh of J2C channels...");

    try {
      // Call the initializeDatabaseWithGuildsAndJ2CChannels function to refresh J2C channels
      await initializeDatabaseWithGuildsAndJ2CChannels(this.client);
      await interaction.editReply({
        content: "J2C channels refresh completed.",
      });
    } catch (error) {
      console.error("Error during manual J2C channels refresh:", error);
      await interaction.editReply({
        content:
          "An error occurred during the refresh process. Check logs for details.",
      });
    }
  }
}
