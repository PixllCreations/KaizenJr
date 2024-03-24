import {
  ChatInputCommandInteraction,
  Collection,
  EmbedBuilder,
  Events,
} from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import Command from "../../base/classes/Command";
import { developerUserIds } from "../../config/config";

/**
 * Represents an event handler for processing chat input command interactions.
 */

export default class CommandHandler extends Event {
  /**
   * Creates an instance of CommandHandler.
   * @param {CustomClient} client - The custom client instance.
   */

  constructor(client: CustomClient) {
    super(client, {
      name: Events.InteractionCreate,
      description: "Command Handler event",
      once: false,
    });
  }

  /**
   * Executes the command handler logic.
   * @param {ChatInputCommandInteraction} interaction - The interaction received.
   */

  async Execute(interaction: ChatInputCommandInteraction) {
    // Check if the interaction is a chat input command
    if (!interaction.isChatInputCommand()) return;

    // Retrieve the command associated with the interaction
    const command: Command = this.client.commands.get(interaction.commandName)!;

    // If the command does not exist, reply with a message and delete the command
    if (!command)
      return (
        //@ts-ignore
        interaction.reply({
          content: "This command does not exist!",
          ephemeral: true,
        }) && this.client.commands.delete(interaction.commandName)
      );

    // Check if the command is restricted to developers only
    if (command.dev && !developerUserIds.includes(interaction.user.id))
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(`❌ This command is only available to developers.`),
        ],
        ephemeral: true,
      });

    const { cooldowns } = this.client;

    // Initialize cooldowns for the command if not present
    if (!cooldowns.has(command.name))
      cooldowns.set(command.name, new Collection());

    const now = Date.now();
    const timestamps = cooldowns.get(command.name)!;
    const cooldownAmount = (command.cooldown || 3) * 1000;

    // Check if the user is on cooldown for the command
    if (
      timestamps.has(interaction.user.id) &&
      now < (timestamps.get(interaction.user.id) || 0) + cooldownAmount
    )
      return interaction.reply({
        embeds: [
          new EmbedBuilder()
            .setColor("Red")
            .setDescription(
              `❌ Please wait another \`${(
                ((timestamps.get(interaction.user.id) || 0) +
                  cooldownAmount -
                  now) /
                1000
              ).toFixed(1)}\` seconds to run this command!`
            ),
        ],
        ephemeral: true,
      });

    // Add the user to cooldown
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);

    try {
      const subCommandGroup = interaction.options.getSubcommandGroup(false);
      const subCommand = `${interaction.commandName}${
        subCommandGroup ? `.${subCommandGroup}` : ""
      }.${interaction.options.getSubcommand(false) || ""}`;

      // Execute sub-command or main command
      return (
        this.client.subCommands.get(subCommand)?.Execute(interaction) ||
        command.Execute(interaction)
      );
    } catch (ex) {
      console.log(ex);
    }
  }
}
