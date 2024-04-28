// src/commands/subcommands/ByDate.ts
import CustomClient from "../../../base/classes/CustomClient";
import SubCommand from "../../../base/classes/SubCommand";
import { ChatInputCommandInteraction } from "discord.js";
import { respondToInteraction } from "../../../base/functions/respondToInteraction";
import CommandTypes from "../../../base/enums/CommandType";
import { refreshEmotesCache } from "../../../modules/nba/utils/redisUtils/teamEmotes";

export default class Refresh extends SubCommand {
  constructor(client: CustomClient) {
    super(client, {
      name: "refresh",
      description: "Refresh all team emotes to the cache.",
      type: CommandTypes.SubCommand,
      options: [],
    });
  }

  async Execute(interaction: ChatInputCommandInteraction): Promise<void> {
    const redis = this.client.redisClient;

    try {
      await refreshEmotesCache(redis);
      await respondToInteraction(interaction, {
        content: `Successfully refreshed every team emote to the cache.`,
      });
    } catch (error) {
      await respondToInteraction(interaction, {
        content: `Error refreshing emotes to the cache: ${error}`,
      });
      console.error(`Error refreshing emotes to the cache:`, error);
    }
  }
}
