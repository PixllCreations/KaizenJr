import { ModalSubmitInteraction, TextChannel, inlineCode } from "discord.js";
import GuildInformation from "../../base/schemas/GuildInformation";
import { logMessage } from "../../base/functions/logMessage";
import CustomClient from "../../base/classes/CustomClient";

/**
 * Handles the channel deletion confirmation submitted through a modal.
 *
 * @param {ModalSubmitInteraction} interaction - The modal submit interaction that triggered this function.
 */

export async function handleDeleteConfirmModal(
  interaction: ModalSubmitInteraction
) {
  // Ensure that the interaction is associated with a guild.
  if (!interaction.guild) {
    console.error("Guild is not available for this interaction.");
    return;
  }

  // Attempt to retrieve the channel intended for deletion.
  const channelToDelete = interaction.guild.channels.cache.get(
    interaction.channelId!
  ) as TextChannel;

  // Check if the channel exists.
  if (!channelToDelete) {
    console.error("Channel to delete not found.");
    return;
  }

  try {
    // Proceed with deleting the channel from Discord.
    await channelToDelete.delete("Channel deleted via modal submission.");
    console.log(
      `Channel ${channelToDelete.name} deleted successfully from Discord.`
    );

    // Update the database to reflect the removal of the temporary channel.
    const guildDoc = await GuildInformation.findOneAndUpdate(
      {
        guildId: interaction.guildId,
        "j2cChannels.tempChannels.tempChannelId": channelToDelete.id,
      },
      {
        $pull: {
          "j2cChannels.$.tempChannels": { tempChannelId: channelToDelete.id },
        },
      },
      { new: true }
    );

    // If the guild has a log channel, log the deletion.
    if (guildDoc && guildDoc.logChannelId) {
      const logChannel = interaction.guild.channels.cache.get(
        guildDoc.logChannelId
      ) as TextChannel;
      logMessage(
        interaction.guild,
        interaction.client as CustomClient,
        `Temporary channel was deleted in ${inlineCode(
          `${interaction.guild.name}`
        )}.`,
        "Manual Delete",
        interaction.user.id,
        channelToDelete.name,
        channelToDelete.id
      );
    }

    console.log("Database updated successfully to reflect channel deletion.");
    // Notify the user of successful deletion.
    await interaction.reply({
      content: "Channel deleted successfully.",
      ephemeral: true,
    });
  } catch (error) {
    console.error(`Error during channel deletion: ${error}`);
    // Notify the user of any errors encountered during the deletion process.
    await interaction.reply({
      content:
        "An error occurred while deleting the channel. Please check the logs for more information.",
      ephemeral: true,
    });
  }
}
