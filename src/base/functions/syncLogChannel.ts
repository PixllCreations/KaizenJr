import GuildInformation from "../schemas/GuildInformation";
import { ChannelType, TextChannel } from "discord.js";
import CustomClient from "../classes/CustomClient";

/**
 * Synchronize the server log channels for all guilds.
 * This function iterates through each guild that the client is in and updates its log channel
 * based on the presence of a channel named "server-logs".
 * If the log channel exists, its ID is saved in the guild's document in the database.
 *
 * @param {CustomClient} client - The client instance used to interact with the Discord API.
 */

export async function syncLogChannels(client: CustomClient) {
  console.log("Updating log channels for all guilds...");

  let logChannelId: string | null = null;

  // Iterate through each guild that the client is in
  client.guilds.cache.forEach(async (guild) => {
    try {
      // Attempt to retrieve the guild document from the database
      const guildDoc = await GuildInformation.findOne({ guildId: guild.id });
      if (!guildDoc) {
        console.log(
          `Guild document not found for guild ${guild.name} (${guild.id}), skipping log channel update.`
        );
        return;
      }

      // Fetch channels from the guild
      const channels = await guild.channels.fetch();

      // Find the log channel named "server-logs"
      const logChannel = channels.find(
        (channel) =>
          channel?.type === ChannelType.GuildText &&
          channel.name === "server-logs"
      ) as TextChannel;

      if (logChannel) {
        // Update the log channel ID in the guild document and save it to the database
        guildDoc.logChannelId = logChannel.id;
        await guildDoc.save();
        console.log(
          `Log channel updated for guild ${guild.name}: ${logChannel.name} (${logChannel.id})`
        );
      } else {
        guildDoc.logChannelId = "null";
        await guildDoc.save();
        console.log(
          `Log channel not found in guild ${guild.name}, no update made.`
        );
      }
    } catch (error) {
      console.error(
        `Error updating log channel for guild ${guild.name}:`,
        error
      );
    }
  });

  return logChannelId;
}
