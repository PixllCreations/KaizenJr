import { VoiceState, VoiceChannel, TextChannel } from "discord.js";
import GuildInformation from "../../base/schemas/GuildInformation";
import { deleteChannelIfEmpty } from "./deleteEmptyChannel";
import CustomClient from "../../base/classes/CustomClient";
import { logMessage } from "../../base/functions/logMessage";
import { findCbopRole } from "../../base/functions/findCbopRole";

/**
 * Handles the logic when a user leaves a voice channel, specifically checking if a temporary channel should be deleted.
 *
 * @param {VoiceState} oldState - The previous state of the voice state.
 * @param {CustomClient} client - The client instance used to interact with the Discord API.
 */

export const handleLeave = async (
  oldState: VoiceState,
  client: CustomClient
) => {
  const deleteDelay = 30000; // 30 seconds in milliseconds
  // Retrieve the channel the user left
  const channel = oldState.channel as VoiceChannel;
  // Proceed only if the channel exists and is now empty
  if (!channel || channel.members.size > 0) {
    console.log(
      "Channel still has members, or channel data is missing. No action taken."
    );
    return;
  }

  // Fetch the guild document from the database
  const guildDoc = await GuildInformation.findOne({
    guildId: oldState.guild.id,
  });
  if (!guildDoc || !guildDoc.logChannelId) {
    console.log("Guild document not found, unable to update the database.");
    if (oldState.guild) {
      const cbopRoleMention = await findCbopRole(oldState.guild);
      await logMessage(
        oldState.guild,
        client,
        `Guild document not found. Unable to process leave events properly.`,
        "Error",
        undefined,
        undefined,
        undefined,
        undefined,
        cbopRoleMention
      );
    }
    return;
  }

  console.log(
    "Processing leave event for empty channel, checking for temporary channel status..."
  );
  guildDoc.j2cChannels.forEach(async (j2cChannel) => {
    // Find the temporary channel within the J2C channel list
    const tempChannel = j2cChannel.tempChannels.find(
      (temp) => temp.tempChannelId === channel.id
    );
    if (tempChannel && !tempChannel.manualDeletion) {
      console.log(
        `Setting deletion timer for empty temporary channel: ${channel.id}`
      );
      tempChannel.isEmpty = true;
      tempChannel.deletionTime = new Date(new Date().getTime() + deleteDelay); // Set deletion using current time + delay in milliseconds(deleteDelay)
      await guildDoc.save();

      // Initiate the deletion process after the delay
      setTimeout(
        () =>
          deleteChannelIfEmpty(
            oldState.guild.id,
            j2cChannel.j2cChannelId,
            channel.id,
            client
          ),
        deleteDelay
      );

      // Log the initiation of the deletion timer for the temporary channel, if a log channel is specified
      const logChannelId = guildDoc.logChannelId;
      if (logChannelId) {
        const logChannel = oldState.guild.channels.cache.get(
          logChannelId
        ) as TextChannel;
        if (logChannel && !tempChannel.manualDeletion) {
          logMessage(
            oldState.guild,
            client,
            `A deletion timer has been started for the empty temporary channel.`,
            "Timer",
            undefined,
            channel.name,
            channel.id
          ).catch(console.error); // Handle potential errors gracefully
        }
      }
    }
  });
};
