import { ActionRowBuilder, AnyThreadChannel, StringSelectMenuBuilder } from "discord.js"

const row = new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
	new StringSelectMenuBuilder()
		.setCustomId("help")
		.setPlaceholder("Choose an option")
		.setMinValues(1)
		.setMaxValues(1)
		.addOptions([
			{
				label: "Yes",
				value: "yes",
				description: "Yes. I'm trying to run a script.",
				emoji: "📜"
			},
			{
				label: "No",
				value: "no",
				description: "No. This is a general Simba issue.",
				emoji: "🦁"
			}
		])
)

export async function openThread(thread: AnyThreadChannel) {
	await thread.send({
		content:
			"You need to answer a couple of questions before others can reply.\n\n" +
			"Is your issue related to a specific script?",
		components: [row]
	})
}
