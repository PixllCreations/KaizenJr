import { ChatInputCommandInteraction } from "discord.js";
import CustomClient from "../classes/CustomClient";
import SubCommand from "./SubCommand";
import ISubCommandGroup from "../interfaces/ISubCommandGroup";
import CommandTypes from "../enums/CommandType";

export default class SubCommandGroup implements ISubCommandGroup {
  client: CustomClient;
  name: string;
  type: CommandTypes;
  subCommands: Map<string, SubCommand>;

  constructor(client: CustomClient, name: string) {
    this.client = client;
    this.name = name;
    this.type = CommandTypes.SubCommandGroup;
    this.subCommands = new Map<string, SubCommand>();
  }

  registerSubCommand(subCommand: SubCommand): void {
    if (!this.subCommands.has(subCommand.name)) {
      this.subCommands.set(subCommand.name, subCommand);
    } else {
      throw new Error(
        `Subcommand ${subCommand.name} is already registered in ${this.name}`
      );
    }
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const subCommandName = interaction.options.getSubcommand();
    const subCommand = this.subCommands.get(subCommandName);
    if (subCommand) {
      await subCommand.Execute(interaction);
    } else {
      throw new Error("Subcommand not found: " + subCommandName);
    }
  }
}
