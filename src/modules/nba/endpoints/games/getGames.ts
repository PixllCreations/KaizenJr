import axios from "axios";
import IGamesOptions from "../../interfaces/IGameOptions";
import { bdlAuth } from "../../../../config/config";

const baseUrl = "http://api.balldontlie.io/v1/games";

export async function getGames(options?: IGamesOptions) {
  const params = new URLSearchParams();
  if (options) {
    for (const [key, value] of Object.entries(options)) {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(`${key}[]`, item.toString()));
      } else {
        params.append(key, value.toString());
      }
    }
  }

  try {
    const response = await axios.get(baseUrl, { headers: bdlAuth, params });
    return response.data;
  } catch (error) {
    console.error("Error fetching games:", error);
    throw error;
  }
}
