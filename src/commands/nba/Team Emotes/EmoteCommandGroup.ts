// src/commands/subcommands/ScheduleCommandGroup.ts
import { ApplicationCommandOptionType } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import SubCommandGroup from "../../../base/classes/SubCommandGroup";
import Update from "./Update";
import Refresh from "./Refresh";
export default class TeamEmoteCommandGroup extends SubCommandGroup {
  constructor(client: CustomClient) {
    super(client, "emote");
    this.registerSubCommand(new Update(client));
    this.registerSubCommand(new Refresh(client));
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
