import axios from "axios";
import { sportsDbAuth } from "../../../../../config/config";
import ISportsEvent from "./interfaces/ISportsEvent";

export async function getEventId(
  homeTeam: string,
  awayTeam: string,
  eventDate: string
) {
  const formattedHome = formatTeamName(homeTeam);
  const formattedAway = formatTeamName(awayTeam);
  const baseURL = `https://www.thesportsdb.com/api/v1/json/${sportsDbAuth}`;
  const eventEndpoint = `/searchevents.php?e=${formattedHome}_vs_${formattedAway}`;

  try {
    const response = await axios.get(`${baseURL}${eventEndpoint}`);
    const events = response.data.event;
    const matchingEvent = events.find(
      (event: ISportsEvent) =>
        event.dateEvent === eventDate || event.dateEventLocal === eventDate
    );
    return matchingEvent ? matchingEvent.idEvent : null;
  } catch (error) {
    console.error("Error fetching event ID:", error);
    return null;
  }
}

function formatTeamName(teamName: string) {
  return teamName.replace(/\bLA\b/, "Los Angeles");
}
