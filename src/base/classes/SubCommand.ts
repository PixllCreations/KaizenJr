import { ChatInputCommandInteraction, CacheType } from "discord.js";
import ISubCommand from "../interfaces/ISubCommand";
import CustomClient from "./CustomClient";
import ISubCommandOptions from "../interfaces/ISubCommandOptions";
import CommandTypes from "../enums/CommandType";

/**
 * Class representing a subcommand for a slash command.
 */

export default class SubCommand implements ISubCommand {
  client: CustomClient;
  name: string;
  description: string;
  type: CommandTypes;
  options: object;

  /**
   * Creates an instance of SubCommand.
   * @param {CustomClient} client - The custom client instance.
   * @param {ISubCommandOptions} options - Options for the subcommand.
   */

  constructor(client: CustomClient, options: ISubCommandOptions) {
    this.client = client;
    this.name = options.name;
    this.description = options.description;
    this.type = CommandTypes.SubCommand;
    this.options = options.options;
  }

  /**
   * Executes the subcommand logic.
   * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
   */

  Execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    throw new Error(
      "Execute method not implemented in subcommand: " + this.name
    );
  }
}
