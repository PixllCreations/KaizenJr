import { GuildChannel, ModalSubmitInteraction, inlineCode } from "discord.js";
import GuildInformation from "../../base/schemas/GuildInformation";
import { logMessage } from "../../base/functions/logMessage";
import CustomClient from "../../base/classes/CustomClient";
import { findCbopRole } from "../../base/functions/findCbopRole";

/**
 * Handles the action of renaming a channel through a modal submission.
 * Ensures that the interaction is within a guild, finds the intended channel,
 * checks for existence, and then proceeds to rename the channel. Logs the action
 * and updates the guild document in the database accordingly.
 *
 * @param {ModalSubmitInteraction} interaction - The interaction that triggered this function.
 */

export async function handleRenameModal(interaction: ModalSubmitInteraction) {
  if (!interaction.guild) {
    console.error("Guild is not available for this interaction.");
    return;
  }

  const cbopRoleMention = await findCbopRole(interaction.guild);

  // Extract new name from the modal's input field
  const newName = interaction.fields.getTextInputValue("new-name");

  // Retrieve the channel intended to be renamed from the interaction
  const channelToRename = interaction.guild.channels.cache.get(
    interaction.channelId!
  ) as GuildChannel;

  if (!channelToRename) {
    console.error("Channel to rename not found.");
    await interaction
      .reply({
        content:
          "The channel intended for renaming was not found. Please try again.",
        ephemeral: true,
      })
      .catch(console.error);
    return;
  }

  try {
    // Rename the channel on Discord
    const oldName = channelToRename.name;
    await channelToRename.setName(
      newName,
      "Channel renamed via modal submission."
    );
    console.log(`Channel ${channelToRename.id} renamed to ${newName}`);

    // Fetch guild document from the database
    const guildDoc = await GuildInformation.findOne({
      guildId: channelToRename.guildId,
    });
    if (!guildDoc) throw new Error("Guild document not found.");

    // Update the database with the new channel name if applicable
    if (guildDoc) {
      const j2cChannel = guildDoc.j2cChannels.find((j2c) =>
        j2c.tempChannels.some(
          (temp) => temp.tempChannelId === channelToRename.id
        )
      );

      if (j2cChannel) {
        const tempChannel = j2cChannel.tempChannels.find(
          (temp) => temp.tempChannelId === channelToRename.id
        );
        if (tempChannel) {
          tempChannel.tempChannelName = newName;
          await guildDoc.save();
          console.log(
            `Database updated successfully for channel rename: ${channelToRename.id}`
          );
        } else {
          console.error(
            "Temporary channel not found in the database for updates."
          );
        }
      } else {
        console.error("J2C channel not found in the guild document.");
      }

      // Respond to the user confirming the rename action
      await interaction.reply({
        content: `Channel renamed successfully from "${oldName}" to "${newName}".`,
        ephemeral: true,
      });
    } else {
      console.error("Guild document not found, unable to update the database.");
    }
    logMessage(
      interaction.guild,
      interaction.client as CustomClient,
      `Channel renamed: ${inlineCode(`${oldName}`)} in ${inlineCode(
        `${interaction.guild.name}`
      )} has been renamed to ${inlineCode(`${newName}`)} by <@${
        interaction.user.id
      }>.`,
      "Rename",
      interaction.user.id,
      oldName,
      channelToRename.id,
      newName
    );
  } catch (error) {
    console.error(`Error during channel rename: ${error}`);
    await interaction.reply({
      content: "An error occurred while renaming the channel.",
      ephemeral: true,
    });

    if (interaction.guild) {
      // Check if 'error' is an instance of Error to access its 'message' property safely
      const errorMessage =
        error instanceof Error ? error.message : "An unknown error occurred";
      logMessage(
        interaction.guild,
        interaction.client as CustomClient,
        `An error occurred during channel rename: ${inlineCode(
          `${errorMessage}`
        )}`,
        "Error",
        undefined,
        channelToRename.name,
        channelToRename.id,
        undefined,
        cbopRoleMention
      );
    }
  }
}
