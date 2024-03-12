import { VoiceState, Events } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import { handleJoin } from "../../voice/voiceChannelUtil/handleJoin";
import { handleLeave } from "../../voice/voiceChannelUtil/handleLeave";

export default class VoiceStateChange extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.VoiceStateUpdate,
      description: "Handles voice state changes.",
      once: false,
    });
  }

  /**
   * Executes the voice state update logic, managing voice channel joins, leaves, and switches.
   *
   * @param {VoiceState} oldState - The previous voice state.
   * @param {VoiceState} newState - The new voice state.
   */

  async Execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
    console.log("Voice state update detected.");
    const oldChannel = oldState.channel;
    const newChannel = newState.channel;

    // Check if the user switched channels.
    if (oldChannel && newChannel && oldChannel.id !== newChannel.id) {
      console.log(
        `User switched from "${oldChannel.name}" to "${newChannel.name}".`
      );

      // Handle leaving the old channel.
      console.log(`Handling leave for the old channel: ${oldChannel.name}`);
      await handleLeave(oldState, this.client);

      // Handle joining the new channel if it's a J2C channel.
      if (newChannel.name.includes("(J2C)")) {
        console.log(
          `Handling join for the new J2C channel: ${newChannel.name}`
        );
        await handleJoin(oldState, newState, this.client);
      }
    }
    // User joined a new channel from being nowhere.
    else if (!oldChannel && newChannel) {
      console.log(`User joined a new channel: ${newChannel.name}.`);
      if (newChannel.name.includes("(J2C)")) {
        console.log(
          `Handling join for the new J2C channel: ${newChannel.name}`
        );
        await handleJoin(null, newState, this.client);
      }
    }
    // User left a channel without joining a new one.
    else if (oldChannel && !newChannel) {
      console.log(`User left the channel: ${oldChannel.name}`);
      await handleLeave(oldState, this.client);
    }
  }
}
