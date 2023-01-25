import { MenuExtendedInteraction } from "../../types/interactions"
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js"
import { ModalExtendedInteraction } from "../../types/interactions"

const rowCompile =
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("compile_simba")
      .setPlaceholder("Choose an option")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions([
        {
          label: "Yes",
          value: "yes",
          description: "I can see that message when I start the script.",
          emoji: "📜",
        },
        {
          label: "No",
          value: "no",
          description: "I can't see that message when I start the script.",
          emoji: "🦁",
        },
      ])
  )

const scriptReply =
  new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
    new StringSelectMenuBuilder()
      .setCustomId("compile_script")
      .setPlaceholder("Choose an option")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions([
        {
          label: "Yes",
          value: "yes",
          description: "I can see that message when I start the script.",
          emoji: "📜",
        },
        {
          label: "No",
          value: "no",
          description: "I can't see that message when I start the script.",
          emoji: "🦁",
        },
      ])
  )

function replyMsg(component: ActionRowBuilder<StringSelectMenuBuilder>) {
  return {
    content:
      "Thank you.\n\n\n" +
      "Does the script say:\n" +
      "```\nSuccesfully compiled in ... milliseconds.```" +
      "When you start it?",
    components: [component],
  }
}

export async function compileReply(interaction: MenuExtendedInteraction) {
  await interaction.deferReply({ ephemeral: true })

  interaction.message.delete()

  await interaction
    .editReply(replyMsg(rowCompile))
    .catch((error) => console.log(error))
}

export async function modalCompileReply(interaction: ModalExtendedInteraction) {
  await interaction.deferReply({ ephemeral: true })

  interaction.message.delete()

  await interaction
    .editReply(replyMsg(scriptReply))
    .catch((error) => console.log(error))
}
