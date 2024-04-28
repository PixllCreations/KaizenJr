import {
  APIEmbedField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import IGame from "../interfaces/IGame";
import { extractTimeIfUtc } from "../utils/extractTimeIfUtc";
import getTimeToStart from "../utils/timeToStart";
import IResult from "../interfaces/IResult";
import { getStreams } from "../data/SportsDB/endpoints/getStreams";
import { getEventId } from "../data/SportsDB/endpoints/getEventId";
import { getTeamEmote } from "../utils/redisUtils/teamEmotes";
import redisClient from "../../../config/redisClient";

export async function checkGameToStart(
  currentGame: IGame,
  previousGameState: IGame,
  date: string
): Promise<IResult> {
  const timeData = extractTimeIfUtc(currentGame.status);
  console.log(`Time data: ${timeData}`);
  const uniqueStreams = new Map();

  if (!timeData) {
    return { occurred: false };
  }
  console.log(`Executing check for games to start events`);
  const gameStartTime = new Date(timeData); // Status is displayed as '2024-04-24T02:00:00Z' if game hasn't started yet.
  const timeDifference = getTimeToStart(gameStartTime); // Time difference in milliseconds

  // Convert time difference from milliseconds to hours and minutes
  console.log(
    `Time until game start: ${Math.floor(
      timeDifference / 3600000
    )} hours and ${Math.floor((timeDifference % 3600000) / 60000)} minutes`
  );

  const embed = new EmbedBuilder()
    .setColor("Blurple")
    .setThumbnail(
      "https://imgtr.ee/images/2024/04/21/cbbadb96b21198dcea032c9123ec76d6.png"
    )
    .setFooter({
      text: `The time is shown in your local timezone.`,
    })
    .setTimestamp();

  let eventDescription = "";
  let eventId = "";

  // Calculate unix start time to make use of Discords unix time stamps
  const unixStartTime = Math.floor(gameStartTime.getTime() / 1000);

  // Check if the game has just started
  if (currentGame.period === 1 && previousGameState.period === 0) {
    eventDescription = "Game has begun!";
    eventId = "Game Start";
  }
  // Announce game is starting soon
  else if (timeDifference <= 0 && currentGame.time === null) {
    eventDescription = `Starting soon!`;
    eventId = "Game Start Soon";
  }
  // Announce time until game start
  else if (timeDifference <= 15 * 60 * 1000) {
    // 15 minutes
    eventDescription = `Starts <t:${unixStartTime}:R> - <t:${unixStartTime}:t>`;
    eventId = "Starting in 15";
  } else if (timeDifference <= 30 * 60 * 1000) {
    // 30 minutes
    eventDescription = `Starts <t:${unixStartTime}:R> - <t:${unixStartTime}:t>`;
    eventId = "Starting in 30";
  } else if (timeDifference <= 60 * 60 * 1000) {
    // 1 hour
    eventDescription = `Starts <t:${unixStartTime}:R> - <t:${unixStartTime}:t>`;
    eventId = "Starting in 60";
  } else if (timeDifference <= 180 * 60 * 1000) {
    // 3 hours
    eventDescription = `Starts <t:${unixStartTime}:R> - <t:${unixStartTime}:t>`;
    eventId = "Starting in 180";
  } else if (timeDifference <= 360 * 60 * 1000) {
    // 6 hours
    eventDescription = `Starts <t:${unixStartTime}:R> - <t:${unixStartTime}:t>`;
    eventId = "Starting in 360";
  } else {
    // If none of the above, no upcoming start event within 6 hours
    return { occurred: false };
  }

  // If we set an event description, set the embed and return it
  if (eventDescription && eventDescription !== "") {
    // Fetch streams
    const idEvent = await getEventId(
      currentGame.home_team.full_name,
      currentGame.visitor_team.full_name,
      date
    );
    const streams = await getStreams(idEvent); // Assuming each game object has an idEvent field

    let streamsField = streams.map((stream) => `${stream.emote}`).join(", ");
    streamsField =
      streams.length > 0 ? `Streams: ${streamsField}` : "No streams available";

    streams.forEach((stream) => {
      if (!uniqueStreams.has(stream.name)) {
        uniqueStreams.set(stream.name, stream);
      }
    });

    const homeTeamIcon = await getTeamEmote(
      redisClient,
      currentGame.home_team.id
    );

    const awayTeamIcon = await getTeamEmote(
      redisClient,
      currentGame.visitor_team.id
    );

    // Initialize embed field
    const embedField: APIEmbedField = {
      name: `${homeTeamIcon}   ${currentGame.home_team.full_name} vs ${currentGame.home_team.full_name}   ${awayTeamIcon}`,
      value: `${streamsField} - <t:${unixStartTime}:t>`, // Will be filled based on the event
      inline: false,
    };

    const components = [];

    // Create buttons for unique streams
    const row = new ActionRowBuilder<ButtonBuilder>();
    uniqueStreams.forEach((stream) => {
      const button = new ButtonBuilder()
        .setStyle(ButtonStyle.Link)
        .setLabel(stream.displayName)
        .setURL(stream.link)
        .setEmoji(stream.emote);
      row.addComponents(button);
    });

    if (row.components.length > 0) {
      components.push(row);
    }

    embed
      .setDescription(eventDescription)
      .setTitle(
        `${currentGame.home_team.abbreviation} ${currentGame.home_team.name}   ${homeTeamIcon}   vs   ${awayTeamIcon}   ${currentGame.visitor_team.abbreviation} ${currentGame.visitor_team.name}`
      )
      .setFields(embedField);

    return {
      occurred: true,
      eventDescription,
      eventId,
      embed,
      components: components.length > 0 ? components : undefined,
    };
  }
  return { occurred: false };
}
