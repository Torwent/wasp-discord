import {
  ActionRowBuilder,
  ModalActionRowComponentBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} from "discord.js"
import { Menu } from "../../structures/Interactions"
import { compileReply } from "../components/compile"

const modal = new ModalBuilder()
  .setCustomId("help")
  .setTitle("Script Information")
// Add components to modal

// Create the text input components
const scriptIdInput = new TextInputBuilder()
  .setCustomId("id")
  // The label is the prompt the user sees for this input
  .setLabel("What is the script id? (First line)")
  // Short means only a single line of text
  .setStyle(TextInputStyle.Short)

const scriptRevisionInput = new TextInputBuilder()
  .setCustomId("revision")
  .setLabel("What is the script revision? (Second line)")
  // Paragraph means multiple lines of text.
  .setStyle(TextInputStyle.Short)

// An action row only holds one text input,
// so you need one action row per text input.
const firstActionRow =
  new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
    scriptIdInput
  )
const secondActionRow =
  new ActionRowBuilder<ModalActionRowComponentBuilder>().addComponents(
    scriptRevisionInput
  )

// Add inputs to the modal
modal.addComponents(firstActionRow, secondActionRow)

export default new Menu({
  customId: "help",
  type: 3,
  run: async ({ interaction }) => {
    if (interaction.values.length === 0) return

    if (!interaction.channel.isThread()) return
    const thread = interaction.channel
    const owner = await thread.fetchOwner()

    if (interaction.user.id !== owner.user.id) return

    if (interaction.values.includes("yes")) {
      return await interaction.showModal(modal)
    } else if (interaction.values.includes("no")) {
      return await compileReply(interaction)
    }
  },
})
