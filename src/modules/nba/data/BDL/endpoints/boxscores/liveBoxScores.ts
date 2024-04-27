import axios from "axios";
import { bdlAuth } from "../../../../../../config/config";

const baseUrl = "https://api.balldontlie.io/v1/box_scores/live";

export async function getLiveBoxScores() {
  try {
    const response = await axios.get(baseUrl, { headers: bdlAuth });

    return response.data;
  } catch (error) {
    console.error("Error fetching live box scores:", error);
    return null;
  }
}
