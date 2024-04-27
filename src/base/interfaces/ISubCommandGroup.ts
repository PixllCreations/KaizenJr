import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";
import SubCommand from "../classes/SubCommand";
import CommandTypes from "../enums/CommandType";

export default interface ISubCommandGroup {
  client: CustomClient;
  name: string;
  type: CommandTypes;
  subCommands: Map<string, SubCommand>;

  registerSubCommand(subCommand: SubCommand): void;
  Execute(interaction: ChatInputCommandInteraction): Promise<void>;
}
