import { Command } from "$structures/Interactions"

export default new Command({
	name: "wiki",
	description: "Replies with a link to osrs wiki resources",
	options: [
		{
			name: "search",
			description: "Replies with a link to osrs wiki resources",
			type: 3,
			required: true
		},

		{
			type: 6,
			name: "user",
			description: "Pings a user",
			required: false
		}
	],

	run: async ({ interaction }) => {
		let link = "https://oldschool.runescape.wiki/?search="

		if (interaction.options.data.length > 0) {
			interaction.options.data.forEach((entry) => {
				if (entry.name === "user") link = "<@" + entry.value + "> Check: " + link
				if (entry.name === "search") link += encodeURI(entry.value as string)
			})
		}

		interaction.followUp(link)
	}
})
