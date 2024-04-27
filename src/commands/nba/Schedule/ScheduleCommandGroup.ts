// src/commands/subcommands/ScheduleCommandGroup.ts
import { ApplicationCommandOptionType } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommandGroup from "../../../base/classes/SubCommandGroup";
import ByTeamName from "./ByTeamName";
import ByDate from "./ByDate";

export default class ScheduleCommandGroup extends SubCommandGroup {
  constructor(client: CustomClient) {
    super(client, "schedule");
    this.registerSubCommand(new ByTeamName(client));
    this.registerSubCommand(new ByDate(client));
  }

  // Optional: Define specific options if needed for the interaction response
  get options() {
    return Array.from(this.subCommands.values()).map((subCommand) => {
      return {
        name: subCommand.name,
        description: subCommand.description,
        type: ApplicationCommandOptionType.Subcommand,
        options: subCommand.options,
      };
    });
  }
}
