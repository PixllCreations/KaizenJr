import { EmbedBuilder } from "discord.js";

export default interface IResult {
  occurred: boolean;
  eventDescription?: string;
  eventId?: string;
  embed?: EmbedBuilder;
}
