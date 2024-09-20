import type { Command } from "$lib/interaction"
import { ApplicationCommandType, Collection, Role } from "discord.js"

const minutes = 10
const pointsLimit = 100
const admins = ["202210488493408256", "830442256984047636"]
const protectedChannels = ["📢announcements", "🎋updates", "🗳polls"]

interface Reporter {
	id: string
	points: number
}

interface ReportedUser {
	id: string
	reporters: Map<string, Reporter>
}

interface TimedoutUser extends ReportedUser {
	times: number
}

const reportedUsers: Map<string, ReportedUser> = new Map()
const recentTimeouts: Map<string, TimedoutUser> = new Map()

function getReporterPoints(roles: Collection<string, Role>) {
	if (roles.find((r) => r.name === "Moderator")) return 20
	if (roles.find((r) => r.name === "Scripter")) return 15
	if (roles.find((r) => r.name === "Tester")) return 12
	if (roles.find((r) => r.name === "VIP")) return 9
	if (roles.find((r) => r.name === "Premium")) return 6
	return 0
}

function getReportedPoints(reported: ReportedUser) {
	let total = 0
	for (const reporter of reported.reporters.values()) total += reporter.points // Sum the points
	return total
}

function addReporter(reported: ReportedUser, id: string, points: number) {
	reported.reporters.set(id, {
		id: id,
		points: points
	})

	setTimeout(() => {
		reported.reporters.delete(id)
	}, minutes * 60 * 1000)
}

function joinReporters(
	map1: Map<string, Reporter>,
	map2: Map<string, Reporter>
): Map<string, Reporter> {
	const merged = new Map<string, Reporter>(map1)

	for (const [id, reporter] of map2) {
		if (!merged.has(id)) {
			merged.set(id, reporter)
			continue
		}

		const existingReporter = merged.get(id)
		if (existingReporter) existingReporter.points += reporter.points
	}

	return merged
}

const command: Command = {
	name: "Report",
	type: ApplicationCommandType.Message,
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
		const message = interaction.options.data[0]

		if (protectedChannels.includes(interaction.channel.name)) {
			await interaction.editReply("Messages on this channel cannot be managed.")
			return
		}

		const caller = interaction.member
		const reported = message.message.member

		if (reported.id === "") {
			await interaction.editReply(
				"User discord ID is empty. Maybe this user already left the server?"
			)
			return
		} else if (admins.includes(reported.id)) {
			await interaction.editReply("You can't manage this user.")
			return
		}

		if (reported.communicationDisabledUntil > new Date()) {
			await interaction.editReply(`This user is already timed out.`)
			return
		}

		const roles = caller.roles.cache

		let points = getReporterPoints(roles)

		if (points === 0) {
			await interaction.editReply("You don't have a role that can contribute to manage the server.")
			return
		}

		let reportedUser = reportedUsers.get(reported.id)

		if (!reportedUser) {
			reportedUser = { id: reported.id, reporters: new Map() }
		} else if (reportedUser.reporters.has(caller.id)) {
			if (admins.includes(caller.id)) {
				await interaction.editReply(
					`You've already reported this user, your report will be valid for ${minutes} minutes. The user has : ${getReportedPoints(
						reportedUser
					)} points.`
				)
			} else {
				await interaction.editReply(
					`You've already reported this user, your report will be valid for ${minutes} minutes.`
				)
			}
			return
		}

		addReporter(reportedUser, caller.id, points)

		await interaction.editReply(
			`<@${reported.id}> has been reported by you. If enough people report them in a short time window they will be muted.`
		)

		if (getReportedPoints(reportedUser) <= pointsLimit) {
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
		await message.message.reply(
			`You've been reported by several people and have been muted for ${minutes} minutes.`
		)

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

		const content = message.message.content
		const management = interaction.guild.channels.cache.find((ch) => ch.name === "🎮management")
		if (!management.isTextBased()) return
		management.send(
			`<@${reported.id}> was timed out for ${time} minutes for the following message:\n\n${content}`
		)

		await message.message.delete()
		return
	}
}

export default command
