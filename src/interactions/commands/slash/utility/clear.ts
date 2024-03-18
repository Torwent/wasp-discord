import type { Command } from "$lib/interaction"
import type { GuildTextBasedChannel } from "discord.js"

const command: Command = {
	name: "clear",
	description: "Clears messages from the channel",
	defaultMemberPermissions: ["Administrator"],
	run: async ({ interaction }) => {
		await interaction.deferReply()
		const channel = interaction.channel
		if (!channel) return

		const messages = await channel.messages.fetch()

		if (messages.size > 0) {
			console.log("TODO!")
			interaction.followUp("TODO!")
		}
	}
}

export default command
