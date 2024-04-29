import { EmbedBuilder } from "discord.js";
import { IStreamListEntry } from "../../data/SportsDB/endpoints/interfaces/IStreamListEntry";
import IGame from "../../interfaces/IGame";
import {
  buildStartEmbedField,
  buildStreamButton,
  formatStreamsField,
  processStreams,
} from "../buildGameStartEmbed";
import {
  formatAbbrTitle,
  formatGameTitle,
  getGameClock,
  isTimeMatch,
} from "../formatGameEmbed";
import { getEventId } from "../../data/SportsDB/endpoints/getEventId";
import { getStreams } from "../../data/SportsDB/endpoints/getStreams";
import { getUnixTime } from "date-fns";

export async function buildGameScheduleEmbed(games: IGame[], date: string) {
  const nbaBadge = "<:frdjqy1536585083:1231513139116376096>";
  const embed = new EmbedBuilder()
    .setTitle(`${nbaBadge} Game Schedule`)
    .setColor("Blurple")
    .setThumbnail(
      "https://imgtr.ee/images/2024/04/21/cbbadb96b21198dcea032c9123ec76d6.png"
    )
    .setFooter({
      text: `The time is shown in your local timezone.`,
    });
  embed.addFields({ name: "\u00A0", value: "\u00A0", inline: false });

  let uniqueStreams = new Map<string, IStreamListEntry>();

  for (const game of games) {
    const gameTitle = await formatAbbrTitle(game);
    const idEvent = await getEventId(
      game.home_team.full_name,
      game.visitor_team.full_name,
      date
    );
    // Fetch streams
    const streams = await getStreams(idEvent); // Assuming each game object has an idEvent field
    let streamsField = formatStreamsField(streams);
    uniqueStreams = processStreams(streams, uniqueStreams);
    let gameDetail = checkGameStatus(game);

    gameDetail = `${gameDetail}\n${streamsField}`;
    const embedField = buildStartEmbedField(gameTitle, gameDetail);

    embed
      .addFields(embedField)
      .addFields({ name: "\u00A0", value: "\u00A0", inline: false });
  }
  const components = buildStreamButton(uniqueStreams);
  return {
    embeds: [embed],
    components: components.length > 0 ? components : undefined,
  };
}

function checkGameStatus(game: IGame) {
  let gameDetail = "Details not available";
  // Determine what to display based on the game status
  if (game.period === 0 && game.time === null) {
    const unixStartTime = getUnixTime(new Date(game.status));
    gameDetail = `Start Time: <t:${unixStartTime}:t> (<t:${unixStartTime}:R>)`;
  } else if (game.status === "Final") {
    gameDetail = `Final Score: ${game.home_team_score} - ${game.visitor_team_score}`;
  } else {
    const timeMatch = isTimeMatch(game.time);
    let timeDisplay = "Unable to get game clock time";

    if (timeMatch) {
      const { quarter, minutes, seconds } = getGameClock(timeMatch);
      timeDisplay = `${minutes}:${seconds}`;
    }
    const timeRemaining = game.time
      ? `Time Left: ${timeDisplay}`
      : `In Progress`;
    gameDetail = `${game.status} - ${timeRemaining}\nScore: ${game.home_team_score} - ${game.visitor_team_score}`;
  }
  return gameDetail;
}
