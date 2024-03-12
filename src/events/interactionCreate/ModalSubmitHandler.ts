import { Interaction, Events, ModalSubmitInteraction } from "discord.js";
import CustomClient from "../../base/classes/CustomClient";
import Event from "../../base/classes/Event";
import { handleRenameModal } from "../../voice/DashboardManager/handleRename";
import { handleDeleteConfirmModal } from "../../voice/DashboardManager/handleDeleteConfirm";

/**
 * Handles modal submission interactions for renaming and deleting channels.
 * This class listens to the InteractionCreate event and filters for modal submissions.
 * Based on the customId of the submission, it delegates the task to the appropriate handler function.
 */

export default class ModalSubmitHandler extends Event {
  constructor(client: CustomClient) {
    super(client, {
      name: Events.InteractionCreate,
      description:
        "Handles modal submit interactions for renaming and deleting channels.",
      once: false,
    });
  }

  async Execute(interaction: Interaction): Promise<void> {
    // Ensure the interaction is a ModalSubmit interaction.
    if (!interaction.isModalSubmit()) return;

    // Cast the interaction to a more specific type for ease of use.
    const modalInteraction = interaction as ModalSubmitInteraction;

    switch (modalInteraction.customId) {
      case "rename-modal":
        // Call the handleRenameModal function, passing the modal interaction.
        await handleRenameModal(modalInteraction);
        break;
      case "delete-confirm-modal":
        // Call the handleDeleteConfirmModal function, passing the modal interaction.
        await handleDeleteConfirmModal(modalInteraction);
        break;
      default:
        console.warn(
          `Unhandled modal submit interaction: ${modalInteraction.customId}`
        );
        break;
    }
  }
}
