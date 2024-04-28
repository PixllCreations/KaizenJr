import axios from "axios";
import { ITeam, ITeamApiResponse } from "../../../../interfaces/ITeam";
import { bdlAuth } from "../../../../../../config/config";

const baseUrl = "https://api.balldontlie.io/v1/teams";

export async function getTeams(
  division?: string,
  conference?: string
): Promise<ITeam[]> {
  let url = baseUrl;
  if (division || conference) {
    const queryParams = new URLSearchParams();
    if (division) queryParams.append("division", division);
    if (conference) queryParams.append("conference", conference);
    url += "?" + queryParams.toString();
  }

  try {
    const response = await axios.get(url, { headers: bdlAuth });
    if (response.status !== 200) {
      throw new Error("Failed to fetch teams");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching teams:", error);
    throw error;
  }
}

export async function getTeamById(id: string): Promise<ITeam | null> {
  const url = `${baseUrl}/${id}`;

  try {
    const response = await axios.get(url, { headers: bdlAuth });
    if (response.status !== 200) {
      throw new Error("Failed to fetch team");
    }
    console.log(response.data.data);
    return response.data.data;
  } catch (error) {
    console.error("Error fetching team:", error);
    throw error;
  }
}
