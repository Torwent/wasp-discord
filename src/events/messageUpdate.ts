import { ClientEvent } from "$lib/event"
import { getRole } from "$lib/lib"

const maxTime = 30 * 60 * 1000

export default new ClientEvent("messageUpdate", async (oldMsg, newMsg) => {
	if (newMsg.author.bot) return

	const ageMs = (newMsg.editedTimestamp ?? 0) - oldMsg.createdTimestamp

	if (ageMs <= maxTime) return

	const { member } = newMsg
	if (!member) return
	console.log(member.guild.id)
	const role = getRole(member, ["Administrator", "Moderator", "Scripter", "Tester"])
	if (role) return

	const reply = await newMsg
		.reply(
			"<@" +
				newMsg.author.id +
				"> your message has been deleted.\n\nFor server safety reasons, you can't edit messages that are older than " +
				(maxTime / 60 / 1000).toString() +
				" minutes on this server."
		)
		.catch((e) => console.error(e))
	await newMsg.delete().catch((e) => console.error(e))

	if (reply) setTimeout(async () => await reply.delete(), 15000)
})
