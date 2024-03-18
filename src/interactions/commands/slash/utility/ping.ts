import type { Command } from "$lib/interaction"

const command: Command = {
	name: "ping",
	description: "Replies with Pong!",
	options: [],

	run: async ({ interaction }) => interaction.reply("Pong!")
}

export default command
