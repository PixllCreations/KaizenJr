import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";
import CommandTypes from "../enums/CommandType";

export default interface ISubCommand {
  client: CustomClient;
  name: string;
  description: string;
  type: CommandTypes;
  options: object;

  Execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
