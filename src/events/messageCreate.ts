import { ClientEvent } from "$lib/event"
import { bans } from "$lib/lib"
import { Message, MessageType, TextChannel } from "discord.js"

// Cooldown map to store the last execution time for each user
const cooldowns = new Map()
// Variable to store the last global execution time
const lastGlobalExecution = 0

function getEnding(n: number) {
	return "This message will self-destruct in **" + n + "** seconds."
}

async function timedReply(reply: Message, msg: string, n: number) {
	if (n < 1) {
		await reply.delete()
		return
	}

	await reply.edit(msg + getEnding(n))
	setTimeout(async () => await timedReply(reply, msg, n - 1), 1000)
}

export default new ClientEvent("messageCreate", async (message) => {
	if (message.author.bot) return

	if (message.attachments.size > 0) {
		for (const attachment of message.attachments.values()) {
			const contentType = attachment.contentType || attachment.name

			if (contentType.startsWith("audio") || /\.(mp3|wav|ogg|flac)$/i.test(contentType)) {
				await message.delete()
				return
			}
		}
	}

	if (message.channel === bans) {
		if (message.channel.isThread()) return

		const channel = message.channel as TextChannel

		if (message.type === MessageType.Reply) {
			let msg = "<@" + message.author.id + "> your message has been deleted.\n\n"
			msg += "Please keep conversations within threads.\n\n"
			msg += "If you want to post a new ban please try to stick to the official format:\n\n"
			msg += "```\n"
			msg += "WaspScripts (last 3 weeks):\n"
			msg += "Other bots (last 3 weeks):\n\n"
			msg += "Used a VPN/Proxy:\n"
			msg += "Account age:\n"
			msg += "Suicide bot:\n"
			msg += "Breaks:\n"
			msg += "Sleeps:\n"
			msg += "Daily botting time:\n\n"
			msg += "RWT:\n"
			msg += "Accounts on the same IP:\n"
			msg += "Previous bans:\n"
			msg += "Ban type:\n"
			msg += "```\n\n"

			let n = 30
			const reply = await message.reply(msg + getEnding(n--))
			await message.delete()

			await timedReply(reply, msg, n)
			return
		}

		const thread = await message.startThread({ name: "Ban #" + (channel.threads.cache.size + 1) })
		let msg =
			"Please take posts on this channel with a grain of salt as anyone can post here with no requirements whatsoever "
		msg +=
			" and try to not attack anyone just because you don't believe them or simply don't agree with them."
		await thread.send(msg)
	}

	const role = message.mentions.roles.find((role) => role.name === "Moderator")
	if (role) {
		const userId = message.author.id
		const now = Date.now() // Current time in milliseconds

		const cooldownAmountUser = 5 * 60 * 1000
		const cooldownAmountGlobal = 1 * 60 * 1000

		if (now - lastGlobalExecution < cooldownAmountGlobal) return

		if (cooldowns.has(userId)) {
			const lastTime = cooldowns.get(userId)

			if (now - lastTime < cooldownAmountUser) return
		}

		cooldowns.set(userId, now)

		let msg = "<@" + userId + "> you can report the user by:\n"
		msg += "1. Right clicking them or their message\n"
		msg += "2. Click Apps\n"
		msg += "3. Click Report user/message"

		await message.reply({ content: msg })
	}
})
