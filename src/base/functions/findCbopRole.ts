import { Guild } from "discord.js";

/**
 * Finds the role ID of a role named "Community and Backend Ops" in a given guild.
 *  or returns a plain text mention if the role is not found.
 * @param {Guild} guild The guild to search the role in.
 * @returns {Promise<string | undefined>} The role ID if found, or a plain text mention otherwise.
 */

export async function findCbopRole(guild: Guild): Promise<string | undefined> {
  // Ensure all roles are fetched from the guild
  await guild.roles.fetch();

  // Find the role by name
  const role = guild.roles.cache.find(
    (r) => r.name === "Community and Backend Ops"
  );

  // Return the role ID if the role is found
  return role ? `<@&${role.id}>` : "@CBOPS";
}
