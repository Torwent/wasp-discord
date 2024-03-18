import type { Command } from "$lib/interaction"

const command: Command = {
	name: "ping",
	description: "Replies with Pong!",
	options: [],

	run: async ({ interaction }) => {
		console.log("pong!")
		await interaction.deferReply()
		interaction.followUp("Pong!")
	}
}

export default command
