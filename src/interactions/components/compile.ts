import { MenuExtendedInteraction } from "./../../typings/interactions"
import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js"
import { ModalExtendedInteraction } from "../../typings/interactions"

const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId("compile")
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

const replyMsg = {
  content:
    "Thank you.\n\n\n" +
    "Does the script say:\n" +
    "```\nSuccesfully compiled in ... milliseconds.```" +
    "When you start it?",
  ephemeral: true,
  components: [row],
}

export async function compileReply(
  interaction: ModalExtendedInteraction | MenuExtendedInteraction
) {
  return await interaction.reply(replyMsg)
}
