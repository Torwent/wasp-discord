import { Menu } from "../../structures/Interactions"
import { threadReply } from "../components/close_thread"

export default new Menu({
	customId: "script",
	type: 3,
	run: async ({ interaction }) => {
		if (interaction.values.length === 0) return

		if (!interaction.channel.isThread()) return
		const thread = interaction.channel
		const owner = await thread.fetchOwner()

		if (interaction.user.id !== owner.user.id) return

		if (interaction.values.includes("yes")) {
			thread.setName(thread.name.replace(" - ", " Crash - "))
			thread.setAppliedTags(["1019686956889808987"])
		}

		if (interaction.values.includes("no")) {
			thread.setName(thread.name.replace(" - ", " Bug - "))
			thread.setAppliedTags(["1019686607734972549"])
		}

		await threadReply(interaction)
	}
})
