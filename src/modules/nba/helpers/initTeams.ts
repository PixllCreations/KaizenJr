import { getTeams } from "../endpoints";
import Team from "../models/Team";

/**
 * Initializes or updates the database with NBA team data.
 * @param {string | undefined} conference - The conference to filter teams by.
 * @param {string | undefined} division - The division to filter teams by.
 */

export async function initTeams(conference?: string, division?: string) {
  try {
    // Fetch the latest team data based on the specified criteria
    const teams = await getTeams(division, conference);

    if (teams.length === 0) {
      console.log("No teams found for the specified criteria.");
      return; // Exit early if no teams are found
    }

    const updatePromises = teams.map((team) =>
      Team.updateOne({ id: team.id }, team, { upsert: true }).catch((err) => {
        console.error(`Error updating/inserting team ID ${team.id}:`, err);
        return null; // Return a placeholder to keep the array's structure for Promise.all
      })
    );

    // Await all update operations simultaneously for efficiency
    const results = await Promise.all(updatePromises);

    // Filter out nulls to get the count of successfully processed operations
    const successfulUpdates = results.filter((result) => result !== null);
    console.log(
      `Database updated successfully with ${successfulUpdates.length} of ${teams.length} teams.`
    );

    if (successfulUpdates.length !== teams.length) {
      console.log(
        "Some teams were not updated successfully. Check logs for details."
      );
    }
  } catch (error) {
    console.error("Failed to fetch teams or update the database:", error);
  }
}
