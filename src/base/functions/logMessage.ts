import { EmbedBuilder, Guild, TextChannel, inlineCode } from "discord.js";
import CustomClient from "../classes/CustomClient";
import GuildInformation from "../schemas/GuildInformation";

/**
 * Logs a message to the specified log channel in a guild.
 * @param {Guild} guild The guild to log the message in.
 * @param {CustomClient} client The bot client instance.
 * @param {string} message The message to log.
 */

export async function logMessage(
  guild: Guild,
  client: CustomClient,
  message: string,
  reason:
    | "Rename"
    | "Timer"
    | "Error"
    | "Create"
    | "Timed Delete"
    | "Manual Delete",
  userId?: string,
  channelName?: string,
  channelId?: string,
  newName?: string,
  cbobMention?: string
) {
  const guildDoc = await GuildInformation.findOne({ guildId: guild.id });
  if (!guildDoc || !guildDoc.logChannelId) return;

  const logChannel = await client.channels.fetch(guildDoc.logChannelId);
  if (!logChannel || !(logChannel instanceof TextChannel)) return;

  const embed = new EmbedBuilder().setDescription(message).addFields({
    name: "Guild:",
    value: `${inlineCode(`${guild.name}`)}`,
    inline: false,
  });

  if (reason === "Create") {
    embed.setColor("Green");
    embed.setTitle("🆕 Channel Created");
    embed.addFields(
      {
        name: "Channel:",
        value: `${inlineCode(`${channelName}`)} - ${inlineCode(
          `${channelId}`
        )}`,
        inline: true,
      },
      {
        name: "User:",
        value: `<@${userId}> - ${inlineCode(`${userId}`)}`,
        inline: false,
      }
    );
  }

  if (reason === "Manual Delete") {
    embed.setColor("Orange");
    embed.setTitle("🗑️ Channel Manually Deleted");
    embed.addFields(
      {
        name: "Channel:",
        value: `${inlineCode(`${channelName}`)} -${inlineCode(`${channelId}`)}`,
        inline: true,
      },
      {
        name: "Deleted by:",
        value: `<@${userId}> - ${inlineCode(`${userId}`)}`,
        inline: false,
      }
    );
  }

  if (reason === "Timed Delete") {
    embed.setColor("Orange");
    embed.setTitle("🗑️ Channel Deleted Due to Inactivity");
    embed.addFields({
      name: "Channel:",
      value: `${inlineCode(`${channelName}`)} - ${inlineCode(`${channelId}`)}`,
      inline: true,
    });
  }

  if (reason === "Timer") {
    embed.setColor("Blue");
    embed.setTitle("⏲️ Deletion Timer Started");
    embed.addFields({
      name: "Channel:",
      value: `${inlineCode(`${channelName}`)} - ${inlineCode(`${channelId}`)}`,
      inline: true,
    });
  }

  if (reason === "Rename") {
    embed.setColor("Yellow");
    embed.setTitle("🔔 New Name");
    embed.addFields(
      {
        name: "Old Name:",
        value: `${inlineCode(`${channelName}`)} - ${inlineCode(
          `${channelId}`
        )}`,
        inline: false,
      },
      {
        name: "New Name:",
        value: `${inlineCode(`${newName}`)}`,
        inline: false,
      },
      {
        name: "User:",
        value: `<@${userId}> - ${inlineCode(`${userId}`)}`,
        inline: false,
      }
    );
  }

  if (reason === "Error") {
    embed.setColor("Red");
    embed.setTitle("❌ Error");
    embed.addFields({
      name: "Channel",
      value: `https://discord.com/channels/${
        guild.id
      }/${channelId} - ${inlineCode(`${channelId}`)}`,
      inline: false,
    });
    logChannel
      .send({ content: cbobMention, embeds: [embed] })
      .catch(console.error);
  } else {
    logChannel.send({ embeds: [embed] }).catch(console.error);
  }
}
