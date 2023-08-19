import { Menu } from "$structures/Interactions"
import { threadReply } from "../components/close_thread"
import { openThread } from "../components/script"

export default new Menu({
	customId: "compile_script",
	type: 3,
	run: async ({ interaction }) => {
		if (interaction.values.length === 0) return

		if (!interaction.channel.isThread()) return
		const thread = interaction.channel
		const owner = await thread.fetchOwner()

		if (interaction.user.id !== owner.user.id) return

		if (interaction.values.includes("no")) {
			thread.setName("Simba/Compiling issue - " + interaction.user.username)
			thread.setAppliedTags(["1019687260469346446"])

			return await threadReply(interaction)
		}

		await openThread(interaction)
	}
})
