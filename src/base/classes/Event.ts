import IEvent from "../interfaces/IEvent";
import CustomClient from "./CustomClient";
import IEventOptions from "../interfaces/IEventOptions";
import { Events } from "discord.js";

/**
 * Abstract class representing a Discord event.
 */

export default abstract class Event implements IEvent {
  client: CustomClient;
  name: Events;
  description: string;
  once: boolean;

  /**
   * Creates an instance of Event.
   * @param {CustomClient} client - The custom client instance.
   * @param {IEventOptions} options - The options for the event.
   */

  constructor(client: CustomClient, options: IEventOptions) {
    this.client = client;
    this.name = options.name;
    this.description = options.description;
    this.once = options.once ?? false;
  }

  /**
   * Abstract method that must be implemented by subclasses to execute the event logic.
   * @param {...any} args - Arguments passed to the event handler.
   */

  abstract Execute(...args: any[]): void;
}
