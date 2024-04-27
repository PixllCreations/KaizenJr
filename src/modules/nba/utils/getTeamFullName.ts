import redisClient from "../../../config/redisClient"; // Adjust the import path as needed
import Team from "../models/Team"; // Adjust the import path to your Mongoose model

export async function getTeamFullName(
  teamName: string
): Promise<string | null> {
  const cacheKey = `teamFullName:${teamName.toLowerCase()}`;
  let teamFullName: string | null = await redisClient.get(cacheKey);

  if (!teamFullName) {
    const team = await Team.findOne({ name: teamName }); // Adjust the query as needed
    if (team && team.full_name) {
      teamFullName = team.full_name;
      await redisClient.set(cacheKey, teamFullName, "EX", 86400); // Cache for 24 hours
    } else {
      // Log error or handle the case where team isn't found or full_name is not available
      console.error(
        `Team not found or 'full_name' is missing for: ${teamName}`
      );
      return null;
    }
  }

  return teamFullName;
}
