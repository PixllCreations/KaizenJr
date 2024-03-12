import GuildInformation from "../schemas/GuildInformation";
import { ChannelType, VoiceChannel } from "discord.js";
import { syncLogChannels } from "./syncLogChannel";
import CustomClient from "../classes/CustomClient";

/**
 * Initialize the database with guilds and J2C channels.
 * This function fetches guild information and updates the database with the guilds and their associated J2C channels.
 *
 * @param {CustomClient} client - The client instance used to interact with the Discord API.
 */

export async function initializeDatabaseWithGuildsAndJ2CChannels(
  client: CustomClient
) {
  console.log("Initializing database with guilds and J2C channels...");

  // Iterate through each guild that the client is in
  client.guilds.cache.forEach(async (guild) => {
    try {
      // Attempt to find the guild document in the database
      let guildDoc = await GuildInformation.findOne({ guildId: guild.id });

      // Get the log channel ID using syncLogChannels function
      const logChannelId = await syncLogChannels(client);

      // If the guild document doesn't exist, create a new one
      if (!guildDoc) {
        console.log(`Creating new entry for guild ${guild.name}`);
        guildDoc = new GuildInformation({
          guildId: guild.id,
          guildName: guild.name,
          j2cChannels: [],
          logChannelId: logChannelId || "null", // Set the log channel ID to null if not found
        });
        await guildDoc.save(); // Save the new guild document
      }

      // Fetch channels from the guild
      const channels = await guild.channels.fetch();

      // Filter out the voice channels that are J2C channels
      const currentJ2CChannels = channels.filter(
        (c): c is VoiceChannel =>
          c !== null &&
          c.type === ChannelType.GuildVoice &&
          c.name.includes("(J2C)")
      );

      // Update the guild document with the current J2C channels
      guildDoc.j2cChannels = currentJ2CChannels.map((channel) => ({
        j2cChannelId: channel.id,
        j2cChannelName: channel.name,
        tempChannels:
          guildDoc!.j2cChannels.find((j2c) => j2c.j2cChannelId === channel.id)
            ?.tempChannels || [],
      }));

      // Filter out any J2C channels that no longer exist in the guild
      guildDoc.j2cChannels = guildDoc.j2cChannels.filter((j2c) =>
        currentJ2CChannels.some((channel) => channel.id === j2c.j2cChannelId)
      );

      // Save the updated guild document
      await guildDoc!.save();
      console.log(
        `Updated entry for guild ${guild.name} with ${currentJ2CChannels.size} J2C channels.`
      );
    } catch (error) {
      console.error(`Error updating guild ${guild.name}:`, error);
    }
  });
}
