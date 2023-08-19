import { GuildTextBasedChannel } from "discord.js"
import { Command } from "$structures/Interactions"

export default new Command({
	name: "clear",
	description: "Clears messages from the channel",
	defaultMemberPermissions: ["Administrator"],
	run: async ({ interaction }) => {
		const channel: GuildTextBasedChannel = interaction.channel

		const messages = await channel.messages.fetch()

		if (messages.size != 0) await channel.bulkDelete(messages) //Delete all messages on the channel!
	}
})
