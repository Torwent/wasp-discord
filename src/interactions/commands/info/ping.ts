import { Command } from "$structures/Interactions"

export default new Command({
	name: "ping",
	description: "replies with pong",
	run: async ({ interaction }) => {
		await interaction.reply("Pong")
	}
})
