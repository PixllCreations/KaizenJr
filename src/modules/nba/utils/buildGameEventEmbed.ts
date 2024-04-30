import { EmbedBuilder } from "discord.js";
import redisClient from "../../../config/redisClient";
import IGame from "../interfaces/IGame";
import { getTeamEmote } from "./redisUtils/teamEmotes";
import { formatPlayerStats } from "../helpers/formatBoxScores";
import { buildBoxscoreField } from "../helpers/Impactfulness";
import { IBoxScoreStats } from "../interfaces/IBoxScore";

export async function formatGameTitle(game: IGame) {
  const homeTeamIcon = await getTeamEmote(redisClient, game.home_team.id);
  const awayTeamIcon = await getTeamEmote(redisClient, game.visitor_team.id);

  return `${game.home_team.full_name}   ${homeTeamIcon}   VS   ${awayTeamIcon}   ${game.visitor_team.full_name}`;
}

export async function formatAbbrTitle(game: IGame) {
  const homeTeamIcon = await getTeamEmote(redisClient, game.home_team.id);
  const awayTeamIcon = await getTeamEmote(redisClient, game.visitor_team.id);

  return `${game.home_team.name}   ${homeTeamIcon}   VS   ${awayTeamIcon}   ${game.visitor_team.name}`;
}

export async function buildGameEventEmbed(
  game: IGame,
  boxScores: any,
  eventDescription: string,
  eventId: string
) {
  const topPerformers = buildBoxscoreField(boxScores);

  const homeTeamIcon =
    (await getTeamEmote(redisClient, game.home_team.id)) || "";
  const awayTeamIcon =
    (await getTeamEmote(redisClient, game.visitor_team.id)) || "";

  const homeTeamField = buildTeamField(
    homeTeamIcon,
    game.home_team.name,
    topPerformers.home
  );
  const visitorTeamField = buildTeamField(
    awayTeamIcon,
    game.visitor_team.name,
    topPerformers.away
  );
  const embed = new EmbedBuilder()
    .setColor("Blurple")
    .setTimestamp()
    .setDescription(eventDescription)
    .setTitle(`${await formatGameTitle(game)}`)
    .addFields(homeTeamField, visitorTeamField);

  return { occurred: true, eventDescription, eventId, embed };
}

export function buildTeamField(
  teamIcon: string,
  teamName: string,
  playerBoxScores: IBoxScoreStats[]
) {
  return {
    name: `${teamIcon} ${teamName}`,
    value: playerBoxScores.map(formatPlayerStats).join("\n\n"),
    inline: true,
  };
}

export function isTimeMatch(time: string) {
  return time ? time.match(/Q(\d+) ?(\d*):(\d+(?:\.\d+)?)/) : null;
}

export function getScoreDifferential(homeScore: number, awayScore: number) {
  return Math.abs(homeScore - awayScore);
}

export function getGameClock(time: RegExpMatchArray) {
  const quarter = parseInt(time[1], 10);
  const minutes = parseInt(time[2], 10);
  const seconds = parseInt(time[3], 10);

  return { quarter, minutes, seconds };
}

export function isGameClose(
  quarter: number,
  minutes: number,
  seconds: number,
  scoreDiff: number
) {
  return (
    quarter === 4 &&
    scoreDiff <= 10 &&
    (minutes < 5 || (minutes === 5 && seconds === 0))
  );
}
