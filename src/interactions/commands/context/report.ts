import type { Command } from "$lib/interaction"
import { ApplicationCommandType, Collection, Role, TextChannel } from "discord.js"

const minutes = 15
const pointsLimit = 100
const protectedChannels = [
	"❗rules",
	"📢announcements",
	"🎋updates",
	"🗳polls",
	"❓faq",
	"❗information",
	"📣server-messages",
	"🎮management"
]

interface Reporter {
	id: string
	channel: string
	message: string
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
	if (roles.find((r) => r.name === "Administrator")) return 40
	if (roles.find((r) => r.name === "Moderator")) return 35
	if (roles.find((r) => r.name === "Scripter")) return 20
	if (roles.find((r) => r.name === "Tester")) return 16
	if (roles.find((r) => r.name === "VIP")) return 12
	if (roles.find((r) => r.name === "Premium")) return 8
	return 0
}

function getReportedPoints(reported: ReportedUser) {
	let total = 0
	for (const reporter of reported.reporters.values()) total += reporter.points // Sum the points
	return total
}

function addReporter(
	reported: ReportedUser,
	id: string,
	points: number,
	channel: string,
	message: string
) {
	reported.reporters.set(id, {
		id: id,
		channel,
		message,
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
		console.log("Running report command. Interaction is being deferred for now.")
		await interaction.deferReply({ ephemeral: true })

		console.log("Checking if the current channel is a protected one.")
		if (protectedChannels.includes(interaction.channel.name)) {
			await interaction.editReply("Messages on this channel cannot be managed.")
			return
		}

		console.log("Getting interaction data.")
		const message = interaction.options.data[0]
		const caller = interaction.member
		const reported = message.message.member

		console.log("Checking if the reported ID is valid and if it's an admin ID.")
		if (reported.id === "") {
			await interaction.editReply(
				"User discord ID is empty. Maybe this user already left the server?"
			)
			return
		} else if (reported.id === interaction.guild.ownerId) {
			await interaction.editReply("You can't manage this user.")
			return
		}

		console.log("Checking if the reported user is already timed out so we don't repunish him.")
		if (reported.communicationDisabledUntil > new Date()) {
			await interaction.editReply(`This user is already timed out.`)
			return
		}

		console.log("Getting the caller roles and checking is points worth.")
		const roles = caller.roles.cache
		let points = getReporterPoints(roles)
		console.log("Caller is worth " + points + " points.")

		if (points === 0) {
			await interaction.editReply("You don't have a role that can contribute to manage the server.")
			return
		}

		console.log("Getting the reported user from cache.")
		let reportedUser = reportedUsers.get(reported.id)

		console.log("Setting up reported user if he wasn't cached yet.")
		if (!reportedUser) reportedUser = { id: reported.id, reporters: new Map() }

		console.log("Checking if the caller has already reported the user in the last 10 minutes.")
		if (reportedUser.reporters.has(caller.id)) {
			console.log("Checking if the caller is an admin to print a special message.")
			if (caller.id === interaction.guild.ownerId) {
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

		console.log("Adding the reported to the user.")
		addReporter(reportedUser, caller.id, points, interaction.channelId, message.message.id)

		console.log("Reply to the reporter. Give him a different message if it's an admin")
		if (caller.id === interaction.guild.ownerId) {
			await interaction.editReply(
				`<@${
					reported.id
				}> has been reported by you. If enough people report them in a short time window they will be muted. The user has : ${getReportedPoints(
					reportedUser
				)} points.`
			)
		} else {
			await interaction.editReply(
				`<@${reported.id}> has been reported by you. If enough people report them in a short time window they will be muted.`
			)
		}

		console.log("Get the reported total points and check if it's less than the threshold")
		if (getReportedPoints(reportedUser) <= pointsLimit) {
			console.log("Reported user doesn't deserve a mute yet.")
			reportedUsers.set(reported.id, reportedUser)
			return
		}

		console.log("Reported user will be muted. Fetching cached timedout user")
		let timedoutUser = recentTimeouts.get(reported.id)

		console.log("Setting up timedoutUser")
		if (!timedoutUser) {
			timedoutUser = { id: reported.id, times: 1, reporters: reportedUser.reporters }
		} else {
			timedoutUser.times += 1
			timedoutUser.reporters = joinReporters(timedoutUser.reporters, reportedUser.reporters)
		}

		let time = minutes * timedoutUser.times * 60 * 1000
		if (timedoutUser.times > 3) time = time * 35

		console.log("Timing out user: " + reported.id + " for " + time + " ms.")
		await reported.timeout(time, "User has been reported by several people.")
		console.log("Reply to the last reported message letting the user know he has been muted.")
		await message.message.reply(
			`You've been reported by several people and have been muted for ${minutes} minutes.`
		)

		console.log("Remove the user from the reportedUsers cached list")
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

		console.log("Fetching management server")
		const management = interaction.guild.channels.cache.find(
			(c) => c.name === "🎮management"
		) as TextChannel

		let notification = `<@${reported.id}> was timed out for ${time} minutes for the following messages:`

		console.log("Building the log message")
		for (const reporterID in reportedUser.reporters) {
			const reporter = reportedUser.reporters.get(reporterID)
			const reporterChannel = (await interaction.guild.channels.fetch(
				reporter.channel
			)) as TextChannel

			console.log(
				"Fetching report message: " + reporter.message + " in channel: " + reporter.channel
			)
			const message = await reporterChannel.messages.fetch(reporter.message)

			notification += "\n\n" + message.content
			console.log("Deleting message: " + reporter.message + " in channel: " + reporter.channel)
			await message.delete()
		}

		console.log("Send notification to management:" + notification)
		await management.send(notification)
		return
	}
}

export default command
