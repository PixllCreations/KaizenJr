import { Client, Collection, GatewayIntentBits } from "discord.js";
import ICustomClient from "../interfaces/ICustomClient";
import { token, mongoDbUri } from "../../config/config";
import Handler from "./Handler";
import Command from "./Command";
import SubCommand from "./SubCommand";
import { connect } from "mongoose";
import redisClient from "../../config/redisClient";

/**
 * Custom Discord client class that extends the default Discord.js client.
 */

export default class CustomClient extends Client implements ICustomClient {
  handler: Handler;
  commands: Collection<string, Command>;
  subCommands: Collection<string, SubCommand>;
  cooldowns: Collection<string, Collection<string, number>>;
  public redisClient = redisClient;

  /**
   * Creates an instance of CustomClient.
   */

  constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildVoiceStates,
      ],
    });

    this.handler = new Handler(this);
    this.commands = new Collection();
    this.subCommands = new Collection();
    this.cooldowns = new Collection();
  }

  /**
   * Initializes the bot.
   */

  Init(): void {
    console.log(`Starting the bot.`);
    this.LoadHandlers();

    this.login(token).catch((err) => console.error(err));

    connect(mongoDbUri!)
      .then(() => console.log("Connected to MongoDB."))
      .catch((err) => console.error(err));
  }

  /**
   * Loads event and command handlers.
   */

  LoadHandlers(): void {
    this.handler.LoadEvents();
    this.handler.LoadCommands();
  }
}
