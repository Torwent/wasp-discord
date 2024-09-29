import type { Command } from "$lib/interaction"
import { getReportedPoints, reportedUsers } from "$lib/lib"
import { ApplicationCommandType } from "discord.js"

const command: Command = {
	name: "Report points (message)",
	type: ApplicationCommandType.Message,
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })

		const message = interaction.options.data[0]
		const member = message.message.member

		if (member.id === "") {
			await interaction.editReply("User Discord ID is empty. Maybe the user left the server?")
			return
		}

		const reported = reportedUsers.get(member.id)

		if (!reported) {
			await interaction.editReply("<@" + member.id + "> has **0 report points**.")
			return
		}

		await interaction.editReply(
			"<@" + member.id + "> has **" + getReportedPoints(reported) + " report points**."
		)
	}
}

export default command
