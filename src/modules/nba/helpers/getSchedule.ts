import axios from "axios";
import { format, addDays, parseISO } from "date-fns";
import { bdlAuth } from "../../../config/config";

const apiUrl = "http://api.balldontlie.io/v1/games";

export async function getSchedule(team?: string): Promise<any> {
  const today = new Date();
  const endDate = addDays(today, 1); // Fetch schedule for the next 7 days
  const startDateStr = format(today, "yyyy-MM-dd");
  const endDateStr = format(endDate, "yyyy-MM-dd");

  try {
    let url = `${apiUrl}?start_date=${startDateStr}&end_date=${endDateStr}`;
    if (team) {
      url += `&team=${team}`;
    }
    const response = await axios.get(url, { headers: bdlAuth });
    const games = response.data.data;
    return games;
  } catch (error) {
    console.error("Error fetching schedule:", error);
    return "Error fetching schedule";
  }
}
