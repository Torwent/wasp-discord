import { Button } from "./../../structures/Interactions"
import { ButtonStyle } from "discord.js"

export default new Button({
	customId: "solve",
	label: "Solve",
	style: ButtonStyle.Success,
	type: 2,
	run: async ({ interaction }) => {
		if (!interaction.channel.isThread()) return
		const thread = interaction.channel
		if (thread.locked) return true
		if (thread.archived) await thread.setArchived(false) //need to unarchive to lock it...
		await interaction.deferReply({ ephemeral: true })

		const owner = await thread.fetchOwner()

		if (
			interaction.user.id !== owner.user.id ||
			interaction.member.roles.cache.has("1067385733796593684")
		)
			return await interaction.editReply(
				"Only the OP and <@1067385733796593684> can close the issue!"
			)

		await interaction.editReply(
			"Your issue has been marked as solved. And the post will be closed. Thank you!"
		)

		await thread.setAppliedTags(["1025145279768432670"])

		await thread.setLocked(true, "Issue solved.")
		await thread.setArchived(true, "Issue solved.")
	}
})
