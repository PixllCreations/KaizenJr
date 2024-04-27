import { ChatInputCommandInteraction, CacheType } from "discord.js";
import Category from "../enums/Category";
import ICommand from "../interfaces/ICommand";
import CustomClient from "./CustomClient";
import ICommandOptions from "../interfaces/ICommandOptions";
import CommandTypes from "../enums/CommandType";
/**
 * Represents a command to be executed by the bot.
 */

export default class Command implements ICommand {
  client: CustomClient;
  name: string;
  description: string;
  type: CommandTypes;
  category: Category;
  options: object;
  default_member_permissions: bigint;
  cooldown: number;
  dm_permission: boolean;
  dev: boolean;
  deprecated?: boolean;

  /**
   * Creates an instance of Command.
   * @param {CustomClient} client - The custom client instance.
   * @param {ICommandOptions} options - The options for the command.
   */

  constructor(client: CustomClient, options: ICommandOptions) {
    this.client = client;
    this.name = options.name;
    this.description = options.description;
    this.type = CommandTypes.Command;
    this.category = options.category;
    this.options = options.options;
    this.default_member_permissions = options.default_member_permissions;
    this.cooldown = options.cooldown;
    this.dm_permission = options.dm_permission;
    this.dev = options.dev;
    this.deprecated = options.deprecated;
  }

  /**
   * Executes the command.
   * @param {ChatInputCommandInteraction<CacheType>} interaction - The interaction that triggered the command.
   */

  Execute(interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
    throw new Error("Execute method not implemented in command: " + this.name);
  }
}
