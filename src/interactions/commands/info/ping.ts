import { Command } from "../../../structures/Interactions"

export default new Command({
	name: "ping",
	description: "replies with pong",
	run: async ({ interaction }) => {
		interaction.followUp("Pong")
	}
})
