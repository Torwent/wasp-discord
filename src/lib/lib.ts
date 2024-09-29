import { Collection, Guild, GuildMember, GuildTextBasedChannel, Role } from "discord.js"

async function getGuildChannel(guild: Guild, channel: String) {
	const channels = guild.channels.cache
	return channels.find(
		(ch) => !ch.isDMBased() && ch.isTextBased() && ch.name === channel
	) as GuildTextBasedChannel
}

async function getGuildRole(guild: Guild, role: String) {
	return guild.roles.cache.find((r) => r.name === role)
}

export let management: GuildTextBasedChannel
export let achievements: GuildTextBasedChannel
export let bans: GuildTextBasedChannel

export async function setupChannels(guild: Guild) {
	const channels = await Promise.all([
		getGuildChannel(guild, "🎮management"),
		getGuildChannel(guild, "🏆achievements"),
		getGuildChannel(guild, "🔨bans")
	])

	management = channels[0]
	achievements = channels[1]
	bans = channels[2]
}

export const minutes = 15
export const pointsLimit = 100
export const protectedChannels = [
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
	channel: string | null
	message: string | null
	points: number
}

interface ReportedUser {
	id: string
	reporters: Map<string, Reporter>
}

interface TimedoutUser extends ReportedUser {
	times: number
}

export const reportedUsers: Map<string, ReportedUser> = new Map()
export const recentTimeouts: Map<string, TimedoutUser> = new Map()

export function getReporterPoints(roles: Collection<string, Role>) {
	if (roles.find((r) => r.name === "Administrator")) return 40
	if (roles.find((r) => r.name === "Moderator")) return 35
	if (roles.find((r) => r.name === "Scripter")) return 20
	if (roles.find((r) => r.name === "Tester")) return 16
	if (roles.find((r) => r.name === "VIP")) return 12
	if (roles.find((r) => r.name === "Premium")) return 8
	return 0
}

export function getReportedPoints(reported: ReportedUser) {
	let total = 0
	for (const reporter of reported.reporters.values()) total += reporter.points // Sum the points
	return total
}

export function addReporter(
	reported: ReportedUser,
	id: string,
	points: number,
	channel: string | null,
	message: string | null
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

export function joinReporters(
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

export function getRole(member: GuildMember, roles: string[]) {
	return member.roles.cache.find((role) => roles.includes(role.name))
}
