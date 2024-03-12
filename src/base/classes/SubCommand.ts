import { ChatInputCommandInteraction, CacheType } from "discord.js";
import ISubCommand from "../interfaces/ISubCommand";
import CustomClient from "./CustomClient";
import ISubCommandOptions from "../interfaces/ISubCommandOptions";

/**
 * Class representing a subcommand for a slash command.
 */

export default class SubCommand implements ISubCommand {
  client: CustomClient;
  name: string;

  /**
   * Creates an instance of SubCommand.
   * @param {CustomClient} client - The custom client instance.
   * @param {ISubCommandOptions} options - Options for the subcommand.
   */

  constructor(client: CustomClient, options: ISubCommandOptions) {
    this.client = client;
    this.name = options.name;
  }

  /**
   * Executes the subcommand logic.
   * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction object.
   */

  Execute(interaction: ChatInputCommandInteraction<CacheType>): void {}
}
