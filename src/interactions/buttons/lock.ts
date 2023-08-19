import { Button } from "$structures/Interactions"
import { ButtonStyle } from "discord.js"

export default new Button({
	customId: "lock",
	label: "Close & Lock",
	style: ButtonStyle.Danger,
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

		await interaction.editReply("Your post has been closed and locked. Thank you!")

		await thread.setLocked(true, "Post locked.")
		await thread.setArchived(true, "Post locked.")
	}
})
