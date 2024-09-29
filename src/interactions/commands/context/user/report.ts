import type { Command } from "$lib/interaction"
import {
	addReporter,
	getReportedPoints,
	getReporterPoints,
	joinReporters,
	management,
	minutes,
	pointsLimit,
	protectedChannels,
	recentTimeouts,
	reportedUsers
} from "$lib/lib"
import { ApplicationCommandType, GuildMember, TextChannel } from "discord.js"

const command: Command = {
	name: "Report user",
	type: ApplicationCommandType.User,
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })

		if (protectedChannels.includes(interaction.channel.name)) {
			await interaction.editReply("Messages on this channel cannot be managed.")
			return
		}

		const caller = interaction.member
		const reported = interaction.options.data[0].member as GuildMember

		if (!reported || reported.id === "") {
			await interaction.editReply("User Discord ID is empty. Maybe they already left the server?")
			return
		} else if (reported.id === interaction.guild.ownerId) {
			await interaction.editReply("You can't report this user.")
			return
		} else if (reported.user.bot) {
			await interaction.editReply("You can't report a bot.")
			return
		}

		if (reported.communicationDisabledUntil > new Date()) {
			await interaction.editReply(`This user is already timed out.`)
			return
		}

		const role = caller.roles.cache
		let points = getReporterPoints(role)

		if (points === 0) {
			await interaction.editReply("You don't have a role that can contribute to manage the server.")
			return
		}

		let reportedUser = reportedUsers.get(reported.id)

		if (!reportedUser) reportedUser = { id: reported.id, reporters: new Map() }

		if (reportedUser.reporters.has(caller.id)) {
			const msg = `You've already reported them, your report will expire in ${minutes} minutes.`
			await interaction.editReply(msg)
			return
		}

		addReporter(reportedUser, caller.id, points, null, null)

		const msg = `You've reported <@${reported.id}>. If enough people report them in a short time window they will be muted.`
		await interaction.editReply(msg)

		if (getReportedPoints(reportedUser) <= pointsLimit) {
			console.log("Reported user doesn't deserve a mute yet.")
			reportedUsers.set(reported.id, reportedUser)
			return
		}

		let timedoutUser = recentTimeouts.get(reported.id)

		if (!timedoutUser) {
			timedoutUser = { id: reported.id, times: 1, reporters: reportedUser.reporters }
		} else {
			timedoutUser.times += 1
			timedoutUser.reporters = joinReporters(timedoutUser.reporters, reportedUser.reporters)
		}

		let time = minutes * timedoutUser.times * 60 * 1000
		if (timedoutUser.times > 3) time = time * 35

		await reported.timeout(time, "User has been reported by several people.")

		reportedUsers.delete(reported.id)
		setTimeout(() => {
			let timedoutUser = recentTimeouts.get(reported.id)
			timedoutUser.times -= 1
			if (timedoutUser.times <= 0) {
				recentTimeouts.delete(reported.id)
			} else {
				recentTimeouts.set(reported.id, timedoutUser)
			}
		}, 24 * 60 * 60 * 1000)

		let notification = "<@" + reported.id + "> timed out for **" + Math.round(time / 60000)
		notification += "** minutes for the following:\n\n"

		for (const reporter of reportedUser.reporters.values()) {
			if (reporter.channel && reporter.message) {
				const channel = (await interaction.guild.channels.fetch(reporter.channel)) as TextChannel
				const message = await channel.messages.fetch(reporter.message)

				notification += "\n\n<@" + reporter.id + "> reported:\n" + message.content
				await message.delete()
			}
		}

		await management.send(notification)
		return
	}
}

export default command
