import { MenuExtendedInteraction } from "./../../typings/interactions"
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js"
import { ModalExtendedInteraction } from "../../typings/interactions"

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
    ephemeral: true,
    components: [component],
  }
}

export async function compileReply(interaction: MenuExtendedInteraction) {
  return await interaction.reply(replyMsg(rowCompile))
}

export async function modalCompileReply(interaction: ModalExtendedInteraction) {
  return await interaction.reply(replyMsg(scriptReply))
}
