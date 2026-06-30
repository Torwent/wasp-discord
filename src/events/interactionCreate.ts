import { CommandInteractionOptionResolver, GuildMember, MessageFlags } from "discord.js"
import { client } from ".."

import type { ButtonInteractionEx, CommandExtendedInteraction } from "$lib/interaction"
import { ClientEvent } from "$lib/event"
import { getRole } from "$lib/lib"

export default new ClientEvent("interactionCreate", async (interaction) => {
	const caller = interaction.user.id

	console.log("Interaction ", interaction.id, " in ", interaction.channelId, " by ", caller)

	if (interaction.isButton()) {
		const button = client.buttons.get(interaction.customId)
		if (!button)
			return interaction.reply({
				content: "That button does not exist!",
				flags: MessageFlags.Ephemeral
			})

		const member = interaction.member as GuildMember
		if (!member) {
			return interaction.reply({
				content: "Only members of waspscripts.dev server can use this command.",
				flags: MessageFlags.Ephemeral
			})
		}

		if (button.roles && button.roles.length > 0) {
			const role = getRole(member, button.roles)
			if (!role) {
				return interaction.reply({
					content:
						"Only " + button.roles.join("/") + " roles in waspscripts.dev can use this command.",
					flags: MessageFlags.Ephemeral
				})
			}
		}

		try {
			button.run({
				client,
				member,
				interaction: interaction as ButtonInteractionEx
			})
		} catch (error) {
			console.error("Interaction failed: " + interaction.customId + " error: " + error)
		}
	}

	// Slash command and context menu interactions
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command) return interaction.followUp("That command does not exist!")

		try {
			command.run({
				client,
				interaction: interaction as CommandExtendedInteraction,
				args: interaction.options as CommandInteractionOptionResolver
			})
		} catch (error) {
			console.error("Slash command failed: " + interaction.commandName + " error: " + error)
		}

		return
	}

	if (interaction.isUserContextMenuCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command)
			return interaction.followUp("That command does not exist!").catch((e) => console.error(e))

		try {
			command.run({
				client,
				interaction: interaction as CommandExtendedInteraction,
				args: interaction.options as CommandInteractionOptionResolver
			})
		} catch (error) {
			console.error("Menu command failed: " + interaction.commandName + " error: " + error)
		}

		return
	}

	if (interaction.isMessageContextMenuCommand()) {
		const command = client.commands.get(interaction.commandName)
		if (!command)
			return interaction.followUp("That command does not exist!").catch((e) => console.error(e))

		try {
			command.run({
				client,
				interaction: interaction as CommandExtendedInteraction,
				args: interaction.options as CommandInteractionOptionResolver
			})
		} catch (error) {
			console.error("Menu command failed: " + interaction.commandName + " error: " + error)
		}

		return
	}
})
