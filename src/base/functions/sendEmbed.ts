import { EmbedBuilder, Guild, TextChannel, inlineCode } from "discord.js";
import CustomClient from "../classes/CustomClient";
import GuildInformation from "../schemas/GuildInformation";

/**
 * Logs a message to the specified log channel in a guild.
 * @param {Guild} guild The guild to log the message in.
 * @param {CustomClient} client The bot client instance.
 * @param {string} message The message to log.
 */

const pixelMention = `<@288502024138522626>`;

export async function logMessage(
  guild: Guild,
  client: CustomClient,
  embed: EmbedBuilder,
  reason: "Update Database" | "Error"
) {
  const guildDoc = await GuildInformation.findOne({ guildId: guild.id });
  if (!guildDoc) {
    console.log("No guildDoc found.");
    return;
  }

  if (!guildDoc.logChannelId) {
    console.log(`No log channel found for ${guild.name}`);
  }

  const logChannel = await client.channels.fetch(guildDoc.logChannelId);
  if (!logChannel || !(logChannel instanceof TextChannel)) return;

  embed.addFields({
    name: "Guild:",
    value: `${inlineCode(`${guild.name}`)}`,
    inline: false,
  });

  if (reason === "Update Database") {
    embed.setColor("Green").setTitle(":tealcheckmark:  Successfully Updated!");
  }

  if (reason === "Error") {
    embed.setColor("Red").setTitle("❌ Error");

    logChannel
      .send({ content: pixelMention, embeds: [embed] })
      .catch(console.error);
  } else {
    logChannel.send({ embeds: [embed] }).catch(console.error);
  }
}
