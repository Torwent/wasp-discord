import type { Command } from "$lib/interaction"
import { getReportedPoints, getRole, minutes, reportedUsers } from "$lib/lib"

const command: Command = {
	name: "debug",
	description: "Returns information about user reports",
	options: [{ type: 6, name: "user", description: "Discord user", required: true }],
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
		const role = getRole(interaction.member, ["Moderator", "Administrator"])
		if (role == null) {
			await interaction.editReply("You are not allowed to use this command.")
			return
		}

		const user = interaction.options.data[0].value as string

		if (user === "") {
			await interaction.editReply("Discord ID is empty.")
			return
		}

		const reported = reportedUsers.get(user)

		if (!reported) {
			await interaction.editReply(
				"User <@" + user + "> as not been reported in the last " + minutes + " minutes."
			)
			return
		}

		const guild = interaction.guildId

		let msg = "## User <@" + user + "> has **" + getReportedPoints(reported) + " points**"
		msg += "\n\n### Reporters:"

		for (const reporter of reported.reporters.values()) {
			msg += "\n> User <@" + reporter.id + ">"
			msg += " reported message https://discord.com/channels/"
			msg += guild + "/" + reporter.channel + "/" + reporter.message
		}

		await interaction.editReply(msg)
	}
}

export default command
