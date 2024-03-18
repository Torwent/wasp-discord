import type { Command } from "$lib/interaction"
import type { GuildTextBasedChannel } from "discord.js"

const command: Command = {
	name: "clear",
	description: "Clears messages from the channel",
	defaultMemberPermissions: ["Administrator"],
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
		const channel = interaction.channel as GuildTextBasedChannel | null
		if (!channel) return

		const messages = await channel.messages.fetch({ limit: 100 })
		if (messages.size > 0) {
			channel.bulkDelete(messages)
			interaction.followUp("Last 100 messages were deleted!")
		} else interaction.followUp("No messages to delete found.")
	}
}

export default command
