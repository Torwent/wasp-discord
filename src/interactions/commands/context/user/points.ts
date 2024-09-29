import type { Command } from "$lib/interaction"
import { getReportedPoints, reportedUsers } from "$lib/lib"
import { ApplicationCommandType } from "discord.js"

const command: Command = {
	name: "Report points (user)",
	type: ApplicationCommandType.User,
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })

		const member = interaction.options.data[0].value as string

		if (!member) {
			await interaction.editReply("User Discord ID is empty. Maybe the user left the server?")
			return
		}

		const reported = reportedUsers.get(member)
		if (!reported) {
			await interaction.editReply("<@" + member + "> has **0 report points**.")
			return
		}

		await interaction.editReply(
			"<@" + member + "> has **" + getReportedPoints(reported) + " report points**."
		)
	}
}

export default command
