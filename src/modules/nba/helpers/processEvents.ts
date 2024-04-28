import { EmbedBuilder } from "discord.js";
import CustomClient from "../../../base/classes/CustomClient";
import redisClient from "../../../config/redisClient";
import IGame from "../interfaces/IGame";
import { processAndSaveGameData } from "../utils/saveGame";
import IResult from "../interfaces/IResult";

export async function processEvent(
  client: CustomClient,
  game: IGame,
  result: IResult
) {
  const eventId = result.eventId;
  const embed = result.embed;
  const components = result.components;
  const eventKey = `game:${game.id}:event:${eventId}`;
  const isEventProcessed = await redisClient.get(eventKey);

  if (!isEventProcessed) {
    const channel = client.channels.cache.get("1231440329954295868");

    if (embed && eventId) {
      if (channel && channel.isTextBased()) {
        const serializedComponents =
          result.components?.map((component) => component.toJSON()) ?? [];
        channel.send({
          embeds: [embed],
          components:
            serializedComponents.length > 0 ? serializedComponents : [],
        });
        console.log(`${eventId} message sent to channel`);
      }

      await redisClient.set(eventKey, "true", "EX", 10800);
      console.log(`${eventId} key '${eventKey}' set in Redis.`);

      await processAndSaveGameData(game, eventId);
    } else {
      console.log(`Event '${eventId}' already processed. Skipping.`);
    }
  }
}
