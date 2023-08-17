import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js"
import { MenuExtendedInteraction } from "../../types/interactions"

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
				emoji: "📜"
			},
			{
				label: "No",
				value: "no",
				description: "No. I don't see a red line.",
				emoji: "🦁"
			}
		])
)

export async function openThread(interaction: MenuExtendedInteraction) {
	if (interaction.values.length === 0) return

	if (!interaction.channel.isThread()) return
	const thread = interaction.channel

	await interaction.deferReply({ ephemeral: true })

	if (interaction.values.includes("yes")) {
		thread.setName(thread.name.replace(" - ", " Crash - "))
		thread.setAppliedTags(["1019686607734972549"])
	} else {
		thread.setName(thread.name.replace(" - ", " Bug - "))
		thread.setAppliedTags(["1019686956889808987"])
	}

	await interaction.editReply({
		content: "Does the script stop running with a line highlighted in red?",
		components: [row]
	})
}
