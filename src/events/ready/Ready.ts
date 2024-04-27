import {
  Collection,
  Events,
  REST,
  Routes,
  TextChannel,
  ChannelType,
  EmbedBuilder,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { discordClientId, token } from "../../config/config";
import cron from "node-cron";
import { initializeDatabaseWithGuildsAndJ2CChannels } from "../../base/functions/initializeDatabase";
import { getGames } from "../../modules/nba/data/BDL/endpoints";
import { getLocalDate } from "../../base/functions/getLocalDate";
import IGame from "../../modules/nba/interfaces/IGame";
import { checkGameEvents } from "../../modules/nba/helpers/checkGameEvents";
import Games from "../../modules/nba/models/Game";
import redisClient from "../../config/redisClient";
import { processAndSaveGameData } from "../../modules/nba/utils/saveGame";
import { checkGameToStart } from "../../modules/nba/helpers/checkGameStartEvents";
import { processEvent } from "../../modules/nba/helpers/processEvents";
import { checkGameIsFinal } from "../../modules/nba/helpers/checkGameIsFinal";
import { checkCloseGame } from "../../modules/nba/helpers/checkCloseGame";

export default class Ready extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.ClientReady,
      description: "Executes when the bot becomes ready.",
      once: true, // Ensure this event only triggers once upon startup
    });
  }

  /**
   * Executes actions after the bot is fully ready.
   */

  async Execute() {
    console.log(`${this.client.user?.tag} is now ready and operational.`);

    cron.schedule("* * * * *", async () => {
      try {
        //const date = getLocalDate();
        const specificDate = new Date(2024, 3, 26);
        const utcDateString = specificDate.toUTCString(); // Using toUTCString() method
        const date = specificDate.toISOString();
        console.log(`Checking games for date: ${date}`);
        const games = (await getGames({ dates: [date] })).data;
        console.log(`Found ${games.length} games today.`);
        for (const game of games) {
          try {
            console.log(`Starting processing for game ${game.id}`);
            const gameKey = `game:${game.id}`;
            const previousGame = await redisClient.get(gameKey);
            const previousGameState = previousGame
              ? JSON.parse(previousGame)
              : null;

            if (previousGameState) {
              console.log(`Processing game ${game.id}`);

              const startResult = await checkGameToStart(
                game,
                previousGameState
              );
              console.log(
                "startResult.eventId in ready.ts: ",
                startResult.eventId
              );

              if (startResult.occurred && startResult.eventId) {
                await processEvent(this.client, game, startResult);
              } else {
                console.log(
                  `Start event '${startResult.eventId}' already processed. Skipping.`
                );
              }
            } else {
              console.log(
                `No significant start event detected for game ${game.id}.`
              );
            }

            if (game.time !== null) {
              const eventsResult = await checkGameEvents(game);
              console.log(
                "eventsResult.eventId in ready.ts: ",
                eventsResult.eventId
              );

              if (
                eventsResult.occurred &&
                eventsResult.eventDescription &&
                eventsResult.eventId
              ) {
                await processEvent(this.client, game, eventsResult);
              } else {
                console.log(
                  `Game event '${eventsResult.eventId}' already processed. Skipping.`
                );
              }
            }

            if (
              game.time !== null &&
              game.time !== undefined &&
              game.time.includes("Q4")
            ) {
              const closeGameResult = await checkCloseGame(game);
              console.log(
                "eventsResult.eventId in ready.ts: ",
                closeGameResult.eventId
              );

              if (
                closeGameResult.occurred &&
                closeGameResult.eventDescription &&
                closeGameResult.eventId
              ) {
                await processEvent(this.client, game, closeGameResult);
              } else {
                console.log(
                  `Game event '${closeGameResult.eventId}' already processed. Skipping.`
                );
              }
            }

            if (game.status === "Final") {
              const finalResult = await checkGameIsFinal(game);
              console.log(
                "finalResult.eventId in ready.ts: ",
                finalResult.eventId
              );
              if (
                finalResult.occurred &&
                finalResult.eventDescription &&
                finalResult.eventId
              ) {
                await processEvent(this.client, game, finalResult);
              } else {
                console.log(
                  `Game event '${finalResult.eventId}' already processed. Skipping.`
                );
              }
              // Update Redis with the current state
              await redisClient.set(`game:${game.id}`, JSON.stringify(game));
            }
          } catch (gameError) {
            console.error(`Error processing game ${game.id}: ${gameError}`);
          }
        }
      } catch (error) {
        return console.error(`Scheduler error: ${(error as Error).message}`);
      }
    });

    // Initialize database with guilds and J2C channels information
    // await initializeDatabaseWithGuildsAndJ2CChannels(this.client);

    // Notify 'server-logs' channel in each guild (if exists) about the bot startup
    for (const [guildId, guild] of this.client.guilds.cache) {
      try {
        const channels = await guild.channels.fetch();

        // Look for a channel named 'server-logs' that is a text channel
        const logChannel = channels.find(
          (channel) =>
            channel?.name === "server-logs" &&
            channel.type === ChannelType.GuildText
        ) as TextChannel | undefined;

        // If a 'server-logs' channel is found, send a message about bot readiness
        const onlineEmbed = new EmbedBuilder()
          .setColor("#00ff08")
          .setTitle(" ⚡   TempyJr   ⚡")
          .setDescription(`${this.client.user} is now online! 🚀`)
          .setTimestamp();

        logChannel?.send({ embeds: [onlineEmbed] });
      } catch (error) {
        console.error(
          `Error fetching channels for guild "${guild.name}":`,
          error
        );
      }
    }

    // Update global commands
    const rest = new REST().setToken(token!);
    try {
      const globalCommands: any = await rest.put(
        Routes.applicationCommands(discordClientId!),
        {
          body: this.GetJson(
            this.client.commands.filter((command) => !command.deprecated)
          ),
        }
      );

      console.log(
        `Successfully loaded ${
          (globalCommands as any[]).length
        } global application commands.`
      );
    } catch (error) {
      console.error("Failed to register global application commands:", error);
    }
  }

  /**
   * Prepares JSON payload of commands for registration.
   *
   * @returns {object[]} Array of commands in JSON format for the Discord API.
   */

  private GetJson(commands: Collection<string, Command>) {
    const data: object[] = [];

    commands.forEach((command) => {
      data.push({
        name: command.name,
        description: command.description,
        options: command.options,
        default_member_permissions:
          command.default_member_permissions.toString(),
        dm_permission: command.dm_permission,
      });
    });

    return data;
  }
}
function formatGameUpdateMessage(game: IGame, event: string) {
  return `**${game.home_team.name} vs ${game.visitor_team.name}** - ${event}\n**Score:** ${game.home_team_score} - ${game.visitor_team_score}`;
}
