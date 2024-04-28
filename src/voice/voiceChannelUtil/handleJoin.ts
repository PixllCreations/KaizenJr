import {
  VoiceState,
  VoiceChannel,
  PermissionsBitField,
  inlineCode,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import GuildInformation from "../../base/schemas/GuildInformation";
import { hasPermissions } from "../../base/functions/hasPermissions";
import { logMessage } from "../../base/functions/sendEmbed";

/**
 * Handles the logic when a user joins a voice channel, specifically creating a temporary channel if they join a J2C (Join to Create) channel.
 *
 * @param {VoiceState | null} oldState - The previous state of the voice state.
 * @param {VoiceState} newState - The new state of the voice state.
 * @param {CustomClient} client - The client instance used to interact with the Discord API.
 */

export const handleJoin = async (
  oldState: VoiceState | null,
  newState: VoiceState,
  client: CustomClient
) => {
  // Ensure the user joined a valid J2C channel
  const channel = newState.channel as VoiceChannel;
  if (!channel || !channel.name.includes("(J2C)")) {
    console.log("Joined channel is not a J2C channel, ignoring...");
    return;
  }

  const hasManageChannels = await hasPermissions(
    channel,
    client,
    PermissionsBitField.Flags.ManageChannels
  );

  // Check for permissions
  if (hasManageChannels) {
    // Clone the J2C channel to create a new, temporary channel for the user
    try {
      console.log(`Cloning J2C channel: ${channel.name}`);
      const clonedChannel = await channel.clone({
        name: `${newState.member?.displayName}'s J2C Channel`,
        reason: "J2C Temporary Channel",
      });

      // Move the user to the newly created temporary channel
      console.log(
        `Moving ${newState.member?.displayName} to cloned channel: ${clonedChannel.name}`
      );
      await newState.member?.voice.setChannel(clonedChannel);

      // Update or create a guild document to record the existence of the new temporary channel
      let guildDoc = await GuildInformation.findOne({
        guildId: newState.guild.id,
      });
      if (!guildDoc) {
        console.log(
          "[handleJoin] Guild document not found, attempting to create a new one"
        );
        guildDoc = new GuildInformation({
          guildId: newState.guild.id,
          guildName: newState.guild.name,
          j2cChannels: [],
        });
        await guildDoc.save();
        console.log("[handleJoin] New guild document created successfully.");
      }

      // Update the guild document with the new temporary channel information
      let j2cChannel = guildDoc.j2cChannels.find(
        (j2c) => j2c.j2cChannelId === channel.id
      );
      if (!j2cChannel) {
        console.log(
          "J2C channel not found in guild document, creating a new entry"
        );
        j2cChannel = {
          j2cChannelId: channel.id,
          j2cChannelName: channel.name,
          tempChannels: [],
        };
        guildDoc.j2cChannels.push(j2cChannel);
      }

      // Record the temporary channel's data
      const tempChannelData = {
        tempChannelId: clonedChannel.id,
        tempChannelName: clonedChannel.name,
        creationTime: new Date(),
        deletionTime: null,
        isEmpty: false,
        creatorId: newState.member?.id ?? "unknown",
        manualDeletion: false,
        deletedBy: null,
      };
      j2cChannel.tempChannels.push(tempChannelData);
      await guildDoc.save();
      console.log(
        "Guild document has been updated successfully with new temporary channel information."
      );
      // Log the creation of the new temporary channel in the server's log channel if specified
      if (guildDoc.logChannelId && newState.guild) {
      }
    } catch (error) {
      console.error("Failed to clone channel or move user:", error);
      // Check if the error is a Discord API error with code 50013
      if (error instanceof Error && "code" in error && error.code === 50013) {
        console.log(
          `Missing Permissions in ${inlineCode(`${newState.guild?.name}`)}.`
        );
      }
    }
  }
};
