import {
  Collection,
  Events,
  REST,
  Routes,
  TextChannel,
  ChannelType,
  EmbedBuilder,
  APIApplicationCommand,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { discordClientId, token } from "../../config/config";
import cron from "node-cron";
import { initializeDatabaseWithGuildsAndJ2CChannels } from "../../base/functions/initializeDatabase";
import { getGames } from "../../modules/nba/data/BDL/endpoints";
import { getLocalDate } from "../../base/functions/getLocalDate";
import redisClient from "../../config/redisClient";
import { processEvent } from "../../modules/nba/helpers/processEvents";
import {
  checkCloseGame,
  checkGameEvents,
  checkGameIsFinal,
  checkGameToStart,
} from "../../modules/nba/helpers/gameEventChecks";
import { cacheTeamEmotes } from "../../modules/nba/utils/redisUtils/teamEmotes";

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

    await cacheTeamEmotes(redisClient);

    cron.schedule("* * * * *", async () => {
      try {
        const date = getLocalDate();
        // const specificDate = new Date(2024, 3, 26);
        // const utcDateString = specificDate.toUTCString(); // Using toUTCString() method
        // const date = specificDate.toISOString();
        console.log(`Checking games for date: ${date}`);
        const games = (await getGames({ dates: [date] })).data;
        console.log(`Found ${games.length} games today.`);
        for (const game of games) {
          try {
            console.log(`Starting processing for game ${game.id}`);
            const gameKey = `game:${game.id}`;
            const previousGame = await redisClient.get(gameKey);
            let previousGameState = previousGame
              ? JSON.parse(previousGame)
              : null;
            console.log(previousGameState);

            if (!previousGameState) {
              console.log(
                `No previous game state found for game ${game.id}. Saving current state.`
              );
              await redisClient.set(gameKey, JSON.stringify(game));
              previousGameState = game; // Update previousGameState to current game state for processing
            }

            if (game.status !== "Final") {
              try {
                console.log(
                  `Processing game ${game.home_team.name}vs ${game.visitor_team.name}`
                );

                const startResult = await checkGameToStart(
                  game,
                  previousGameState,
                  date
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
              } catch (startError) {
                console.error(
                  `Error proccessing start event for game ${game.id} - ${game.home_team.name} vs ${game.visitor_team.name}:`,
                  startError
                );
              }
            } else {
              console.log(
                `No significant start event detected for game ${game.id}.`
              );
            }

            if (game.time !== null) {
              try {
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
              } catch (gameEventError) {
                console.error(
                  `Error processing game event for game ${game.id} - ${game.home_team.name} vs ${game.visitor_team.name}:`,
                  gameEventError
                );
              }
            }

            if (
              game.time !== null &&
              game.time !== undefined &&
              game.time.includes("Q4")
            ) {
              try {
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
              } catch (closeGameError) {
                console.error(
                  `Error processing close game event for game ${game.id} - ${game.home_team.name} vs ${game.visitor_team.name}:`,
                  closeGameError
                );
              }
            }

            if (game.status === "Final") {
              try {
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
              } catch (gameFinalError) {
                console.error(
                  `Error processing game final event for game ${game.id} - ${game.home_team.name} vs ${game.visitor_team.name}:`,
                  gameFinalError
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
      // Clear all commands
      await rest.put(Routes.applicationCommands(discordClientId!), {
        body: [],
      });
      console.log("All global commands have been cleared.");

      // Re-register commands if necessary
      const commands = this.GetJson(
        this.client.commands.filter((cmd) => !cmd.deprecated)
      );
      const globalCommands: APIApplicationCommand[] = (await rest.put(
        Routes.applicationCommands(discordClientId!),
        { body: commands }
      )) as APIApplicationCommand[];
      console.log(
        `Successfully registered ${globalCommands.length} global application commands.`
      );
    } catch (error) {
      console.error("Failed to update global application commands:", error);
    }
  }
  /**
   * Prepares JSON payload of commands for registration.
   *
   * @returns {object[]} Array of commands in JSON format for the Discord API.
   */

  private GetJson(commands: Collection<string, Command>) {
    return commands.map((command) => ({
      name: command.name,
      description: command.description,
      options: command.options,
      default_member_permissions: command.default_member_permissions.toString(),
      dm_permission: command.dm_permission,
    }));
  }
}
