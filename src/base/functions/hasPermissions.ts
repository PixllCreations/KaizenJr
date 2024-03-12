import {
  PermissionsBitField,
  GuildChannel,
  TextChannel,
  VoiceChannel,
} from "discord.js";
import CustomClient from "../classes/CustomClient";

/**
 * Checks if the bot has the specified permissions in the given channel.
 * @param {TextChannel | VoiceChannel} channel The channel to check permissions in.
 * @param {CustomClient} client The bot client instance.
 * @param {bigint} permissions The permissions to check for, using PermissionsBitField flags.
 * @returns {boolean} True if the bot has all the specified permissions, false otherwise.
 */

export async function hasPermissions(
  channel: TextChannel | VoiceChannel,
  client: CustomClient,
  permissions: bigint
): Promise<boolean> {
  if (!client.user) return false;

  const permissionsBitField = new PermissionsBitField(permissions);
  const botMember = await channel.guild.members.fetch(client.user?.id);
  return botMember.permissionsIn(channel).has(permissionsBitField);
}
