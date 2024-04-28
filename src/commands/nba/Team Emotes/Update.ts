// src/commands/subcommands/ByDate.ts
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/SubCommand";
import {
  ApplicationCommandOptionType,
  ChatInputCommandInteraction,
} from "discord.js";
import { getTeamById } from "../../../modules/nba/data/BDL/endpoints";
import { respondToInteraction } from "../../../base/functions/respondToInteraction";
import CommandTypes from "../../../base/enums/CommandType";
import { updateTeamEmote } from "../../../modules/nba/utils/redisUtils/teamEmotes";

export default class Update extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "update",
      description: "Update a teams emote.",
      type: CommandTypes.SubCommand,
      options: [
        {
          name: "id",
          description:
            "Specify the team ID that you're updating the emote for.",
          required: true,
          type: ApplicationCommandOptionType.Number,
        },
        {
          name: "emote",
          description:
            "Specify the emote you want to update the database with.",
          required: true,
          type: ApplicationCommandOptionType.String,
        },
      ],
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const teamId = interaction.options.getNumber("id", true);
    const emote = interaction.options.getString("emote", true);
    const team = await getTeamById(teamId.toString());
    console.log(team);
    const teamName = team?.full_name;

    try {
      await updateTeamEmote(teamId, emote, this.client.redisClient);

      await respondToInteraction(interaction, {
        content: `Successfully updated the ${teamName}-${teamId} emote to ${emote}`,
      });
    } catch (error) {
      await respondToInteraction(interaction, {
        content: `Error updating the emote for ${teamName}-${teamId} with input ${emote}: ${error}`,
      });
      console.error(
        `Error updating the emote for ${teamName}-${teamId} with input ${emote}:`,
        error
      );
    }
  }
}
