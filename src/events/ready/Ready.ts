import {
  Collection,
  Events,
  REST,
  Routes,
  TextChannel,
  ChannelType,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { discordClientId, token } from "../../data/config";
import { initializeDatabaseWithGuildsAndJ2CChannels } from "../../base/functions/initializeDatabase";

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

    // Initialize database with guilds and J2C channels information
    await initializeDatabaseWithGuildsAndJ2CChannels(this.client);

    // Notify 'server-logs' channel in each guild (if exists) about the bot startup
    this.client.guilds.cache.forEach(async (guild) => {
      try {
        const channels = await guild.channels.fetch();

        // Look for a channel named 'server-logs' that is a text channel
        const logChannel = channels.find(
          (channel) =>
            channel?.name === "server-logs" &&
            channel.type === ChannelType.GuildText
        ) as TextChannel | undefined;

        // If a 'server-logs' channel is found, send a message about bot readiness
        logChannel?.send(`${this.client.user?.tag} is now online! 🚀`);
      } catch (error) {
        console.error(
          `Error fetching channels for guild "${guild.name}":`,
          error
        );
      }
    });

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
