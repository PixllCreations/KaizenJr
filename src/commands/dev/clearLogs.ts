import { ChatInputCommandInteraction, PermissionsBitField } from "discord.js";
import Command from "../../base/classes/Command";
import CustomClient from "../../base/classes/CustomClient";
import Category from "../../base/enums/Category";
import { developerUserIds } from "../../config/config";

export default class ClearLogs extends Command {
  constructor(client: CustomClient) {
    super(client, {
      name: "clearlogs",
      description: "Clears all messages in the current channel.",
      category: Category.Developer,
      options: [],
      default_member_permissions: PermissionsBitField.Flags.ManageGuild,
      cooldown: 5,
      dm_permission: false,
      dev: true,
      deprecated: false,
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    // Check if the command is being executed within a guild
    if (!interaction.inGuild()) {
      await interaction.reply({
        content: "This command can only be used in a server.",
        ephemeral: true,
      });
      return;
    }

    if (!interaction.member) {
      await interaction.reply({
        content: "Unable to identify user.",
        ephemeral: true,
      });
      return;
    }

    const { channel } = interaction;

    if (!channel) {
      await interaction.reply({
        content: "Unable to identify channel.",
        ephemeral: true,
      });
      return;
    }

    try {
      const messages = await channel.messages.fetch();
      await channel.bulkDelete(messages);
      await interaction.reply({
        content: "All messages have been cleared.",
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error clearing messages:", error);
      await interaction.reply({
        content: "An error occurred while clearing messages.",
        ephemeral: true,
      });
    }
  }
}
