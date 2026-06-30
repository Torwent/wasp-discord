import { ClientEvent } from "$lib/event"
import { getRole, management } from "$lib/lib"

const maxTime = 2 * 24 * 60 * 60 * 1000 //48h

export default new ClientEvent("messageUpdate", async (oldMsg, newMsg) => {
	if (newMsg.author.bot) return

	const ageMs = (newMsg.editedTimestamp ?? 0) - oldMsg.createdTimestamp

	if (ageMs <= maxTime) return

	const { member } = newMsg
	if (!member) return

	const role = getRole(member, ["Administrator", "Moderator", "Scripter", "Tester"])
	if (role) return

	const { guild } = member
	const mod = guild.roles.cache.get("moderator")

	await management
		.send(
			"<@" +
				mod.id +
				"> <@" +
				newMsg.author.id +
				"> edited a message that is more than 48H old: https://discord.com/channels/" +
				newMsg.guildId +
				"/" +
				newMsg.channelId +
				"/" +
				newMsg.id
		)
		.catch((e) => console.error(e))
})
