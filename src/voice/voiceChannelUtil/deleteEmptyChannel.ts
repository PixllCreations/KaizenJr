import { VoiceChannel, TextChannel, inlineCode } from "discord.js";
import GuildInformation from "../../base/schemas/GuildInformation";
import CustomClient from "../../base/classes/CustomClient";
import { logMessage } from "../../base/functions/logMessage";
import { findCbopRole } from "../../base/functions/findCbopRole";

/**
 * Deletes a temporary channel if it is empty and logs the action to a specified log channel within the guild.
 *
 * @param {string} guildId - The ID of the guild where the channel resides.
 * @param {string} j2cChannelId - The ID of the parent J2C channel.
 * @param {string} channelId - The ID of the temporary channel to potentially delete.
 * @param {CustomClient} client - The client instance used to interact with the Discord API.
 */

export async function deleteChannelIfEmpty(
  guildId: string,
  j2cChannelId: string,
  channelId: string,
  client: CustomClient
) {
  const guild = await client.guilds.fetch(guildId);
  if (!guild && !channelId) {
    console.log(`Guild not found: ${guildId}`);
    return;
  }

  // Declaring cbopRoleMention at the top to use throughout the function
  const cbopRoleMention = await findCbopRole(guild);
  const channel = await guild.channels.fetch(channelId);
  const channelName = (channel as VoiceChannel).name;

  try {
    console.log(`Attempting to delete empty temporary channel: ${channelId}`);
    // Attempt to retrieve the guild document from the database
    const guildDoc = await GuildInformation.findOne({ guildId });
    if (!guildDoc) {
      console.log(
        "Guild document not found during deletion check. Aborting..."
      );
      await logMessage(
        guild,
        client,
        `Guild document not found during deletion check. Aborting...`,
        "Error",
        undefined,
        channelName,
        channelId,
        undefined,
        cbopRoleMention
      );
      return;
    }

    // Locate the parent J2C channel within the guild document
    const j2cChannel = guildDoc.j2cChannels.find(
      (j2c) => j2c.j2cChannelId === j2cChannelId
    );
    if (!j2cChannel) {
      console.log(
        "J2C channel not found in guild document during deletion check. Aborting..."
      );
      return;
    }

    // Find the temporary channel to potentially delete
    const tempChannel = j2cChannel.tempChannels.find(
      (temp) => temp.tempChannelId === channelId
    );
    if (!tempChannel || !tempChannel.isEmpty) {
      console.log(
        "Temporary channel is either not found or not empty. Deletion cancelled."
      );
      return;
    }

    // Fetch the channel from Discord to confirm its current state
    const channel = (await client.channels.fetch(channelId)) as VoiceChannel;
    if (channel && channel.members.size === 0) {
      // Delete the channel from Discord
      await channel.delete(
        "Temporary channel is empty and scheduled for deletion"
      );
      console.log(`Deleting empty temporary channel: ${channelId}`);

      j2cChannel.tempChannels = j2cChannel.tempChannels.filter(
        (temp) => temp.tempChannelId !== channelId
      );

      // Log the deletion to the guild's designated log channel
      if (guildDoc.logChannelId) {
        const logChannel = (await guild.channels.fetch(
          guildDoc.logChannelId
        )) as TextChannel;

        logMessage(
          guild,
          client,
          `The temporary channel has been deleted due to inactivity in ${inlineCode(
            `${guildDoc.guildName}`
          )}.`,
          "Timed Delete",
          undefined,
          channel.name,
          channelId
        ).catch(console.error);
      }
    } else {
      console.log(
        "Temporary channel is no longer empty. Resetting deletion time."
      );
      tempChannel.deletionTime = null;
    }

    // Save the updated guild document
    await guildDoc.save();
    console.log("Guild document updated after checking for deletion.");
  } catch (error) {
    console.error("Error occurred during deletion check:", error);
    await logMessage(
      guild,
      client,
      `Error occurred during deletion check: ${inlineCode(`${error}`)}`,
      "Error",
      undefined,
      channelName,
      channelId,
      undefined,
      cbopRoleMention
    );
  }
}
