import {
  APIEmbedField,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
} from "discord.js";
import IGame from "../interfaces/IGame";
import { formatAbbrTitle, formatGameTitle } from "./buildGameEventEmbed";
import { IStreamListEntry } from "../data/SportsDB/endpoints/interfaces/IStreamListEntry";

export async function buildGameStartEmbed(
  game: IGame,
  eventDescription: string,
  unixStartTime: number,
  eventId: string,
  streams: IStreamListEntry[]
) {
  let uniqueStreams = new Map<string, IStreamListEntry>();
  const gameTitle = await formatGameTitle(game);
  const streamsField = formatStreamsField(streams);
  uniqueStreams = processStreams(streams, uniqueStreams);
  const components = buildStreamButton(uniqueStreams);
  const embedField = buildStartEmbedField(gameTitle, streamsField);

  const embed = new EmbedBuilder()
    .setColor("Blurple")
    .setThumbnail(
      "https://imgtr.ee/images/2024/04/21/cbbadb96b21198dcea032c9123ec76d6.png"
    )
    .setFooter({
      text: `The time is shown in your local timezone.`,
    })
    .setTimestamp()
    .setDescription(eventDescription)
    .setTitle(`${await formatAbbrTitle(game)}`)
    .setFields(embedField);

  return {
    occurred: true,
    eventDescription,
    eventId,
    embed,
    components: components.length > 0 ? components : undefined,
  };
}

export function getUnixTime(time: Date) {
  // Calculate unix start time to make use of Discords unix time stamps
  return Math.floor(time.getTime() / 1000);
}

export function buildStartEmbedField(gameTitle: string, streamsField: string) {
  const embedField: APIEmbedField = {
    name: `${gameTitle}`,
    value: `${streamsField}`,
    inline: false,
  };

  return embedField;
}

/**
 * Processes a list of stream entries and adds unique entries to a given map.
 * @param streams Array of stream entries to process.
 * @param uniqueStreams Map object to store unique streams.
 * @returns Updated map with unique streams.
 */
export function processStreams(
  streams: IStreamListEntry[],
  uniqueStreams: Map<string, IStreamListEntry>
): Map<string, IStreamListEntry> {
  streams.forEach((stream) => {
    if (!uniqueStreams.has(stream.name)) {
      uniqueStreams.set(stream.name, stream);
    }
  });
  return uniqueStreams;
}

export function formatStreamsField(streams: IStreamListEntry[]) {
  let streamsField = streams.map((stream) => `${stream.emote}`).join(", ");
  streamsField =
    streams.length > 0 ? `Streams: ${streamsField}` : "No streams available";

  return streamsField;
}

export function buildStreamButton(
  uniqueStreams: Map<string, IStreamListEntry>
) {
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

  return components;
}
