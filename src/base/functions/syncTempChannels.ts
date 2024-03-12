import CustomClient from "../classes/CustomClient";
import GuildInformation from "../schemas/GuildInformation";
import { deleteChannelIfEmpty } from "../../voice/voiceChannelUtil/deleteEmptyChannel";
import { VoiceChannel, StageChannel } from "discord.js";

/**
 * Synchronize temporary channels across all guilds by checking their current state against the database.
 * It updates the database based on whether temporary channels are empty or not found on Discord.
 * @param {CustomClient} client - The Discord client instance.
 */

export async function syncTempChannels(client: CustomClient) {
  try {
    // Retrieve all guild information from the database
    const guilds = await GuildInformation.find({});

    // Iterate through each guild
    for (const guild of guilds) {
      // Fetch the guild from Discord
      const discordGuild = await client.guilds.fetch(guild.guildId);

      // Iterate through each J2C channel in the guild
      for (const j2cChannel of guild.j2cChannels) {
        // Retrieve the corresponding Discord J2C channel
        const discordJ2CChannel = discordGuild.channels.cache.get(
          j2cChannel.j2cChannelId
        );

        // This makes a shallow copy of the tempChannels array to avoid modifying the array during iteration.
        const tempChannelsCopy = [...j2cChannel.tempChannels];

        // Iterate through each temporary channel in the J2C channel
        for (const tempChannel of tempChannelsCopy) {
          // Retrieve the corresponding Discord temporary channel
          const discordTempChannel = discordGuild.channels.cache.get(
            tempChannel.tempChannelId
          );

          // Check if the Discord temporary channel exists
          if (!discordTempChannel) {
            // Remove the temporary channel from the array if it doesn't exist on Discord
            const index = j2cChannel.tempChannels.findIndex(
              (tChannel) => tChannel.tempChannelId === tempChannel.tempChannelId
            );
            if (index !== -1) {
              j2cChannel.tempChannels.splice(index, 1);
              console.log(
                `Temporary channel ${tempChannel.tempChannelId} not found on Discord, removed from database.`
              );
            }
          } else if (
            discordTempChannel instanceof VoiceChannel ||
            discordTempChannel instanceof StageChannel
          ) {
            const isEmpty = discordTempChannel.members.size === 0;
            tempChannel.isEmpty = isEmpty;

            if (isEmpty) {
              await deleteChannelIfEmpty(
                guild.guildId,
                j2cChannel.j2cChannelId,
                tempChannel.tempChannelId,
                client
              );
            }
          } else {
            // Non-voice/stage channels are not expected - log if found
            console.warn(
              `Channel ${tempChannel.tempChannelId} is not a voice or stage channel. Skipping.`
            );
          }
        }
        // Save changes if any modification happened
        if (j2cChannel.tempChannels.length !== tempChannelsCopy.length) {
          await guild.save();
        }
      }
    }
  } catch (error) {
    console.error("Error during synchronization of temporary channels:", error);
  }
}
