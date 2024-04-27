import IHandler from "../interfaces/IHandler";
import path from "path";
import { glob } from "glob";
import CustomClient from "./CustomClient";
import Event from "./Event";
import Command from "./Command";
import SubCommand from "./SubCommand";
import CommandTypes from "../enums/CommandType";

/**
 * Class responsible for loading and handling events, commands, and subcommands.
 */

export default class Handler implements IHandler {
  client: CustomClient;

  /**
   * Creates an instance of Handler.
   * @param {CustomClient} client - The custom client instance.
   */

  constructor(client: CustomClient) {
    this.client = client;
  }

  /**
   * Load all events from the 'events' directory.
   */

  async LoadEvents() {
    const files = (await glob(`build/events/**/*.js`)).map((filePath) =>
      path.resolve(filePath)
    );

    files.map(async (file: string) => {
      const event: Event = new (await import(file)).default(this.client);

      if (!event.name) {
        delete require.cache[require.resolve(file)];
        console.log(`${file.split("/").pop()} does not have a name.`);
        return;
      }

      const execute = (...args: any) => event.Execute(...args);

      if (event.once) {
        // @ts-ignore
        this.client.once(event.name, execute);
      } else {
        // @ts-ignore
        this.client.on(event.name, execute);
      }

      delete require.cache[require.resolve(file)];
    });
  }

  /**
   * Load all commands and subcommands from the 'commands' directory.
   */

  async LoadCommands() {
    const files = (await glob(`build/commands/**/*.js`)).map((filePath) =>
      path.resolve(filePath)
    );

    files.forEach(async (file) => {
      const commandModule = await import(file);
      if (!commandModule.default || !commandModule.default.name) {
        console.error(`The command in ${file} does not export correctly.`);
        return;
      }

      const command = new commandModule.default(this.client);
      if (command.type === CommandTypes.Command) {
        this.client.commands.set(command.name, command);
      } else if (
        command.type === CommandTypes.SubCommand ||
        command.type === CommandTypes.SubCommandGroup
      ) {
        this.client.subCommands.set(command.name, command);
      } else {
        console.error(`Unknown command type for command ${command.name}`);
      }
      delete require.cache[require.resolve(file)];
    });
  }
}
