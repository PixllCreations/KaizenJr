import redisClient from "../../../config/redisClient"; // Adjust the import path as needed
import Team from "../models/Team"; // Adjust the import path to your Mongoose model

export async function cacheTeamId(teamName: string): Promise<string | null> {
  const cacheKey = `teamId:${teamName.toLowerCase()}`;
  let teamId: string | null = await redisClient.get(cacheKey);

  // Check if teamId is not null before attempting to set it in Redis
  if (!teamId) {
    const team = await Team.findOne({ name: teamName }); // Adjust the query as needed
    if (team) {
      teamId = team.id.toString();
      // Now, teamId is guaranteed to be a string, not null, when setting the cache
      await redisClient.set(cacheKey, teamId as string, "EX", 86400); // Cache for 24 hours
    } else {
      // Handle the case where the team isn't found in the database
      return null;
    }
  }

  return teamId;
}
