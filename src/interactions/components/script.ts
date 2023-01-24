import {
  ActionRowBuilder,
  AnyThreadChannel,
  StringSelectMenuBuilder,
} from "discord.js"

const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
  new StringSelectMenuBuilder()
    .setCustomId("script")
    .setPlaceholder("Choose an option")
    .setMinValues(1)
    .setMaxValues(1)
    .addOptions([
      {
        label: "Yes",
        value: "yes",
        description: "Yes. I see a red line.",
        emoji: "📜",
      },
      {
        label: "No",
        value: "no",
        description: "No. I don't see a red line.",
        emoji: "🦁",
      },
    ])
)

export async function openThread(thread: AnyThreadChannel) {
  thread.send({
    content: "Does the script stop running with a line highlighted in red?",
    components: [row],
  })
}
