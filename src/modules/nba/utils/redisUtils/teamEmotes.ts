import { Redis } from "ioredis";
import Team from "../../models/Team";

//---------------------------------Get Team Emote---------------------------------------
export async function getTeamEmote(redisClient: Redis, teamId: number) {
  return await redisClient.get(`teamEmote:${teamId}`);
}

//---------------------------Cache Emotes to Redis from DB-----------------------------
export async function cacheTeamEmotes(redisClient: Redis) {
  try {
    const teams = await Team.find({});
    const filteredTeams = teams.filter((team) => team.id >= 1 && team.id <= 30);
    const promises = filteredTeams.map((team) =>
      redisClient.set(`teamEmote:${team.id}`, team.emote || "")
    );
    await Promise.all(promises);
    console.log("All team emotes have been cached in Redis.");
  } catch (error) {
    console.error("Failed to cache team emotes:", error);
  }
}

//---------------------------------Refresh Emote Cache----------------------------------
export async function refreshEmotesCache(redisClient: Redis) {
  // Clear the current cache
  const keys = await redisClient.keys("teamEmote:*");
  if (keys.length > 0) {
    await redisClient.del(keys);
  }

  // Re-cache all emotes
  await cacheTeamEmotes(redisClient);
}

//---------------------------------Update Team Emote------------------------------------
export async function updateTeamEmote(
  teamId: number,
  newEmote: string,
  redisClient: Redis
) {
  try {
    const result = await Team.findOneAndUpdate(
      { id: teamId },
      { emote: newEmote },
      { new: true }
    );
    if (result) {
      await redisClient.set(`teamEmote:${teamId}`, newEmote); // Update Redis cache
      console.log("Updated Team Emote:", result);
    } else {
      console.log("No team found with that ID");
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error updating team emote:", error.message);
      throw new Error(`Error updating team emote: ${error.message}`);
    } else {
      console.error("Unexpected error type:", error);
      throw new Error("An unexpected error occurred");
    }
  }
}
