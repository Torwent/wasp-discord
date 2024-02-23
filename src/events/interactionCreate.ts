import { ButtonExtendedInteraction, ModalExtendedInteraction } from "../lib/types/interactions"
import { CommandInteractionOptionResolver } from "discord.js"
import { client } from ".."
import { Event } from "$structures/Event"
import { CommandExtendedInteraction, MenuExtendedInteraction } from "../lib/types/interactions"

export default new Event("interactionCreate", async (interaction) => {
	console.log(
		"Interaction created: ",
		interaction.id,
		" in channel: ",
		interaction.channelId,
		" by member: ",
		interaction.member.user.id
	)

	// Slash command interactions
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command) return interaction.followUp("That command does not exist!")

		command.run({
			client,
			interaction: interaction as CommandExtendedInteraction,
			args: interaction.options as CommandInteractionOptionResolver
		})

		return
	}

	// Slash command interactions
	if (interaction.isUserContextMenuCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command) return interaction.followUp("That command does not exist!")

		command.run({
			client,
			interaction: interaction as CommandExtendedInteraction,
			args: interaction.options as CommandInteractionOptionResolver
		})

		return
	}

	//Button interactions
	if (interaction.isButton()) {
		const button = client.buttons.get(interaction.customId)

		if (button == null) return interaction.followUp("That button is not registered!")

		button.run({
			client,
			interaction: interaction as ButtonExtendedInteraction
		})

		return
	}

	//Select menu interactions
	if (interaction.isStringSelectMenu()) {
		const menu = client.menus.get(interaction.customId)

		if (menu == null) return interaction.followUp("That menu is not registered!")

		menu.run({
			client,
			interaction: interaction as MenuExtendedInteraction
		})

		return
	}

	//Modal interactions
	if (interaction.isModalSubmit()) {
		const modal = client.modals.get(interaction.customId)
		console.log("modal is", modal)
		if (modal == null) return interaction.followUp("That modal is not registered!")

		modal.run({
			client,
			interaction: interaction as ModalExtendedInteraction
		})

		return
	}
})
