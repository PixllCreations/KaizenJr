import { getLiveBoxScores } from "../data/BDL/endpoints/boxscores/liveBoxScores";
import IGame from "../interfaces/IGame";
import { extractTimeIfUtc } from "../utils/extractTimeIfUtc";
import { extractBoxScoreData } from "./extractBoxScoreData";
import IResult from "../interfaces/IResult";

import {
  buildGameEventEmbed,
  getGameClock,
  getScoreDifferential,
  isGameClose,
  isTimeMatch,
} from "../utils/buildGameEventEmbed";
import { buildGameStartEmbed } from "../utils/buildGameStartEmbed";
import { getStreams } from "../data/SportsDB/endpoints/getStreams";
import { getEventId } from "../data/SportsDB/endpoints/getEventId";
import { getUnixTime } from "date-fns";
import getTimeToStart from "../utils/timeToStart";

//-----------------------------------------Game Start Event--------------------------------------------------------

export async function checkGameToStart(
  currentGame: IGame,
  previousGameState: IGame,
  date: string
): Promise<IResult> {
  const startTime = extractTimeIfUtc(currentGame.status);

  // console.log(`Start Time: ${startTime}`);

  if (!startTime) {
    console.log(
      "Game status is not in UTC format. Game must be live. Skipping game start check."
    );
    return { occurred: false };
  }
  console.log(`Executing check for games to start events`);

  const timeDifference = getTimeToStart(startTime); // Time difference in milliseconds

  // Convert time difference from milliseconds to hours and minutes
  console.log(
    `Time until game start: ${Math.floor(
      timeDifference / 3600000
    )} hours and ${Math.floor((timeDifference % 3600000) / 60000)} minutes`
  );

  let eventDescription = "";
  let eventId = "";

  // Calculate unix start time to make use of Discords unix time stamps
  const unixStartTime = getUnixTime(startTime);

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
  else if (timeDifference <= 15 * 60 * 1000 && timeDifference) {
    // 15 minutes
    eventDescription = `Starts <t:${unixStartTime}:R> - <t:${unixStartTime}:t>`;
    eventId = "Starting in 15";
  } else if (timeDifference <= 60 * 60 * 1000) {
    // 1 hour
    eventDescription = `Starts <t:${unixStartTime}:R> - <t:${unixStartTime}:t>`;
    eventId = "Starting in 60";
  } else if (timeDifference <= 180 * 60 * 1000) {
    // 3 hours
    eventDescription = `Starts <t:${unixStartTime}:R> - <t:${unixStartTime}:t>`;
    eventId = "Starting in 180";
  } else {
    // If none of the above, no upcoming start event within 3 hours
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
    const streams = await getStreams(idEvent);

    const result = buildGameStartEmbed(
      currentGame,
      eventDescription,
      eventId,
      streams
    );

    return result;
  }
  return { occurred: false };
}

//-----------------------------------------Live Game Events--------------------------------------------------

export async function checkGameEvents(game: IGame): Promise<IResult> {
  const timeData = extractTimeIfUtc(game.status);
  // console.log(timeData);
  // console.log(`Time data: ${timeData}`);

  console.log("Checking for game events...");

  if (!timeData || timeData === null) {
    // Fetch live box scores
    const liveBoxScores = await getLiveBoxScores();

    if (!liveBoxScores) {
      console.error("No live box scores found");
      return { occurred: false };
    }

    const boxScores = await extractBoxScoreData(liveBoxScores, game);

    let eventDescription;
    let eventId;

    // Check for end of each quarter or halftime
    switch (game.time) {
      case "END Q1":
        eventDescription = `** End of 1st Quarter ** \n ** Score: ${game.home_team_score} - ${game.visitor_team_score} **`;
        eventId = "End of 1st Quarter!";
        break;
      case "Half":
        eventDescription = `** Halftime \n Score: ${game.home_team_score} - ${game.visitor_team_score} **`;
        eventId = "Halftime!";
        break;
      case "END Q3":
        eventDescription = `** End of 3rd Quarter ** \n ** Score: ${game.home_team_score} - ${game.visitor_team_score} **`;
        eventId = "End of 3rd Quarter!";
        break;
      case "END Q4":
        eventDescription = `** End of 4th Quarter ** \n ** Final Score: ${game.home_team_score} - ${game.visitor_team_score} **`;
        eventId = "End of 4th Quarter!";
        break;
      case "OT":
        eventDescription = `** Going into Overtime ** \n ** Score: ${game.home_team_score} - ${game.visitor_team_score} **`;
        eventId = "is Going Into OT!";
        break;
    }

    if (eventDescription && eventDescription !== "" && eventId) {
      if (Array.isArray(boxScores)) {
        const result = buildGameEventEmbed(
          game,
          boxScores,
          eventDescription,
          eventId
        );
        return result;
      } else {
        console.error("Error fetching box scores:", boxScores);
      }
    }
  }
  return { occurred: false };
}

//---------------------------------------------Close Game Event------------------------------------------------

/**
 * Checks if the game is close in the last minutes and builds an embed message.
 * @param {IGame} game - Game object containing all game data.
 * @returns {Promise<IResult>} - Result containing event occurrence and embed if applicable.
 */

export async function checkCloseGame(game: IGame): Promise<IResult> {
  const statusData = extractTimeIfUtc(game.status);
  console.log(statusData);
  console.log(`Status data: ${statusData}`);

  console.log("Checking for live game events...");

  try {
    if (!statusData || statusData === null) {
      // Fetch live box scores
      const liveBoxScores = await getLiveBoxScores();

      if (!liveBoxScores) {
        console.error("No live box scores found");
        return { occurred: false };
      }

      const boxScores = await extractBoxScoreData(liveBoxScores, game);

      // Initialize embed

      const timeMatch = isTimeMatch(game.time);

      if (!timeMatch) {
        console.log(
          "Time format is incorrect or missing, skipping time check."
        );
        return { occurred: false };
      }

      const gameClock = getGameClock(timeMatch);

      console.log(
        `Time check: quarter ${gameClock.quarter}, ${gameClock.minutes}:${gameClock.seconds} time remaining`
      );
      const scoreDiff = getScoreDifferential(
        game.home_team_score,
        game.visitor_team_score
      );

      let eventDescription;
      let eventId;

      // Check if the time is between 5:00 and 0:00 and the score difference is 10 or less
      if (
        isGameClose(
          gameClock.quarter,
          gameClock.minutes,
          gameClock.seconds,
          scoreDiff
        )
      ) {
        console.log(
          "Triggering close game event with less than 5 minutes left"
        );
        eventDescription = `**Game is ${
          scoreDiff === 0 ? `tied` : `close!`
        } Score: ${game.home_team_score} - ${game.visitor_team_score} with ${
          gameClock.minutes
        }:${gameClock.seconds} left in the 4th **`;
        eventId = "Close with 5";
      }

      if (eventDescription && eventDescription !== "" && eventId) {
        if (Array.isArray(boxScores)) {
          const result = buildGameEventEmbed(
            game,
            boxScores,
            eventDescription,
            eventId
          );
          return result;
        }
      }
    }
  } catch (error) {
    console.error(`Error processing close game for game ${game.id}: ${error}`);
    return { occurred: false };
  }
  return { occurred: false };
}

//----------------------------------------Game End Check-------------------------------------------------------
export async function checkGameIsFinal(game: IGame): Promise<IResult> {
  console.log("Checking for if the game has finalized...");

  //   console.log(`Game Status in checkGameIsFinal: ${game.status}`);

  // Check if the game is already finalized and missed due to null game.time
  if (game.status === "Final") {
    const eventDescription = `\n**Final Score:** ${game.home_team_score} - ${game.visitor_team_score}\n\n`;
    const eventId = "Game Has Ended";

    // console.log(
    //   `EventDescription set: ${eventDescription} || eventId set: ${eventId}`
    // );

    // Fetch live box scores
    const liveBoxScores = await getLiveBoxScores();

    if (!liveBoxScores) {
      console.error("No live box scores found");
      return { occurred: false };
    }

    const boxScores = await extractBoxScoreData(liveBoxScores, game);

    if (eventDescription && eventDescription !== "") {
      if (Array.isArray(boxScores)) {
        const result = buildGameEventEmbed(
          game,
          boxScores,
          eventDescription,
          eventId
        );

        return result;
      }
    }
  }
  return { occurred: false };
}
