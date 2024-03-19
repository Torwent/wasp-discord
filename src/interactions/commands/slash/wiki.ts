import type { Command } from "$lib/interaction"

const command: Command = {
	name: "wiki",
	description: "Replies with a link to osrs wiki resources",
	options: [
		{
			type: 3,
			name: "search",
			description: "Replies with a link to osrs wiki resources",
			required: true
		},
		{ type: 6, name: "user", description: "Pings a user", required: false }
	],

	run: async ({ interaction }) => {
		await interaction.deferReply()
		let link = "https://oldschool.runescape.wiki/?search="

		interaction.options.data.forEach((entry) => {
			if (entry.name === "user") link = "<@" + entry.value + "> Check: " + link
			if (entry.name === "search") link += encodeURI(entry.value as string)
		})

		interaction.followUp(link)
	}
}

export default command
