import { APIEmbedField, EmbedBuilder } from "discord.js";
import IGame from "../interfaces/IGame";
import { extractTimeIfUtc } from "../utils/extractTimeIfUtc";
import getTimeToStart from "../utils/timeToStart";
import IResult from "../interfaces/IResult";

export function checkGameToStart(
  currentGame: IGame,
  previousGameState: IGame
): IResult {
  const timeData = extractTimeIfUtc(currentGame.status);
  console.log(`Time data: ${timeData}`);

  console.log(`Executing check for games to start events`);

  if (timeData) {
    const gameStartTime = new Date(timeData); // Status is displayed as '2024-04-24T02:00:00Z' if game hasn't started yet.
    const timeDifference = getTimeToStart(gameStartTime); // Time difference in milliseconds
    console.log(`Time difference: ${Math.floor(timeDifference) * 1000}`);

    const embed = new EmbedBuilder().setColor("Blurple").setTimestamp();

    // Initialize embed field
    const embedField: APIEmbedField = {
      name: "Game Start",
      value: "", // Will be filled based on the event
      inline: false, // Adjust as needed
    };

    let eventDescription;
    let eventId;

    // Check if the game has just started
    if (currentGame.period === 1 && previousGameState.period === 0) {
      embedField.value = "Game has begun!";
      eventDescription = "Game Start";
      eventId = "Game Start";
    }

    // Announce time until game start
    if (timeDifference <= 0 && currentGame.time === null) {
      eventDescription = `is starting soon!`;
      eventId = "Game Start Soon";
    }

    // Calculate unix start time to make use of Discords unix time stamps
    const unixStartTime = Math.floor(gameStartTime.getTime() / 1000);

    // Announce time until game start
    if (timeDifference > 0) {
      if (timeDifference <= 15 * 60 * 1000) {
        // 15 minutes
        eventDescription = `starting <t:${unixStartTime}:R>`;
        eventId = "Starting in 15";
      }
    } else if (timeDifference <= 30 * 60 * 1000) {
      // 30 minutes
      eventDescription = `starting <t:${unixStartTime}:R>`;
      eventId = "Starting in 30";
    } else if (timeDifference <= 60 * 60 * 1000) {
      // 1 hour
      eventDescription = `starting <t:${unixStartTime}:R>`;
      eventId = "Starting in 60";
    } else if (timeDifference <= 180 * 60 * 1000) {
      // 3 hours
      eventDescription = `is starting <t:${unixStartTime}:R>`;
      eventId = "Starting in 180";
    } else if (timeDifference <= 360 * 60 * 1000) {
      // 6 hours
      eventDescription = `is starting <t:${unixStartTime}:R>`;
      eventId = "Starting in 360";
    }
    if (eventDescription && eventDescription !== "") {
      embed.setDescription(eventDescription);
      embed.setFields(embedField);
    }
    return { occurred: true, eventDescription, eventId, embed };
  } else {
    return { occurred: false };
  }
}
