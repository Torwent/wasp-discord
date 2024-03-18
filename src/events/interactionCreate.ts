import { CommandInteractionOptionResolver } from "discord.js"
import { client } from ".."

import type { CommandExtendedInteraction } from "$lib/interaction"
import { ClientEvent } from "$lib/event"

export default new ClientEvent("interactionCreate", async (interaction) => {
	console.log(
		"Interaction ",
		interaction.id,
		" in ",
		interaction.channelId,
		" by ",
		interaction.user.id
	)

	// Slash command and context menu interactions
	if (interaction.isChatInputCommand() || interaction.isUserContextMenuCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command) return interaction.followUp("That command does not exist!")

		command.run({
			client,
			interaction: interaction as CommandExtendedInteraction,
			args: interaction.options as CommandInteractionOptionResolver
		})

		return
	}
})
