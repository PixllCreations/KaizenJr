import {
  ChatInputCommandInteraction,
  InteractionEditReplyOptions,
  InteractionReplyOptions,
} from "discord.js";

export async function respondToInteraction(
  interaction: ChatInputCommandInteraction,
  options: InteractionReplyOptions | InteractionEditReplyOptions | string = {}
) {
  try {
    if (interaction.replied || interaction.deferred) {
      if (interaction.deferred && !interaction.replied) {
        // Edit the previous response
        await interaction.editReply(options);
      } else {
        // Send a follow-up message
        await interaction.followUp(options as InteractionReplyOptions);
      }
    } else {
      // Send the initial reply
      await interaction.reply(options as InteractionReplyOptions);
    }
  } catch (error) {
    console.error("Failed to respond to interaction:", error);
    handleErrorInteraction(
      interaction,
      "An error occurred while processing your request."
    );
  }
}

async function handleErrorInteraction(
  interaction: ChatInputCommandInteraction,
  errorMessage: string
) {
  // Handle error responses uniformly
  if (!interaction.replied && !interaction.deferred) {
    await interaction.reply({ content: errorMessage, ephemeral: true });
  } else if (interaction.deferred && !interaction.replied) {
    await interaction.editReply({ content: errorMessage });
  }
}
