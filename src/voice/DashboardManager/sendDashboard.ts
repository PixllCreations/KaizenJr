import {
  VoiceChannel,
  ModalBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  PermissionsBitField,
  TextInputBuilder,
  TextInputStyle,
  EmbedBuilder,
  inlineCode,
} from "discord.js";
import GuildInformation from "../../base/schemas/GuildInformation";
import CustomClient from "../../base/classes/CustomClient";
import { logMessage } from "../../base/functions/logMessage";

/**
 * Sends an interactive dashboard to manage a temporary voice channel, including renaming and deleting options.
 *
 * @param {VoiceChannel} voiceChannel - The voice channel to manage.
 * @param {string} creatorId - The ID of the user who created the temporary channel.
 * @param {CustomClient} client - The client instance used to interact with the Discord API.
 */

export async function sendInteractiveDashboard(
  voiceChannel: VoiceChannel,
  creatorId: string,
  client: CustomClient
): Promise<void> {
  // Embed for dashboard instructions
  const embed = new EmbedBuilder()
    .setColor(0x6aa84f) // Example green color
    .setTitle("Manage Your Channel")
    .setDescription("Use the buttons below to manage your channel.");

  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId("rename-channel")
      .setLabel("Rename")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("delete-channel")
      .setLabel("Delete")
      .setStyle(ButtonStyle.Danger)
  );

  // Sending the dashboard message
  const dashboardMessage = await voiceChannel.send({
    embeds: [embed],
    components: [row],
  });

  // Collector for button interactions
  const collector = dashboardMessage.createMessageComponentCollector({
    time: 60000,
  });

  collector.on("collect", async (interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.guild || !interaction.member) return;

    // Checking permissions
    const hasManageChannelsPermission = interaction.member.permissions.has(
      PermissionsBitField.Flags.ManageChannels
    );

    if (interaction.user.id !== creatorId && !hasManageChannelsPermission) {
      await interaction.reply({
        content: "You are not authorized to manage this channel.",
        ephemeral: true,
      });
      return;
    }

    // Renaming the channel
    if (interaction.customId === "rename-channel") {
      const modal = new ModalBuilder()
        .setCustomId("rename-modal")
        .setTitle("Rename Channel")
        .addComponents(
          new ActionRowBuilder<TextInputBuilder>().addComponents(
            new TextInputBuilder()
              .setCustomId("new-name")
              .setLabel("New Channel Name")
              .setStyle(TextInputStyle.Short)
              .setRequired(true)
          )
        );

      await interaction.showModal(modal);

      // Reset the collector after handling the "rename" action
      collector.resetTimer();

      // Deleting the channel
    } else if (interaction.customId === "delete-channel") {
      try {
        let guildDoc = await GuildInformation.findOne({
          guildId: voiceChannel.guildId,
        });
        if (guildDoc) {
          const j2cChannel = guildDoc.j2cChannels.find((j2c) =>
            j2c.tempChannels.some(
              (temp) => temp.tempChannelId === voiceChannel.id
            )
          );

          if (j2cChannel) {
            // Mark the channel for manual deletion
            const tempChannel = j2cChannel.tempChannels.find(
              (temp) => temp.tempChannelId === voiceChannel.id
            );
            if (tempChannel) {
              tempChannel.manualDeletion = true;
              tempChannel.deletedBy = interaction.user.id;
              await guildDoc.save();

              // Proceed to delete the channel from Discord
              await voiceChannel.delete("Channel deleted by user.");

              // Remove the channel from the database since it's now deleted
              j2cChannel.tempChannels = j2cChannel.tempChannels.filter(
                (temp) => temp.tempChannelId !== voiceChannel.id
              );
              await guildDoc.save();

              // Logging action if log channel is set
              if (guildDoc.logChannelId) {
                logMessage(
                  interaction.guild,
                  client,
                  `The temporary channelhas been manually deleted in ${inlineCode(
                    `${interaction.guild.name}`
                  )}`,
                  "Manual Delete",
                  interaction.user.id,
                  voiceChannel.name,
                  voiceChannel.id
                );
              }
              await interaction.reply({
                content: "Channel deleted successfully.",
                ephemeral: true,
              });
            }
          }
        }
      } catch (error) {
        console.error("Error during channel deletion:", error);
        await interaction.reply({
          content: "Failed to delete the channel. Please try again.",
          ephemeral: true,
        });
      }
    }
  });
}
