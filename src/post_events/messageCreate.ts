import { ClientEvent } from "$lib/event"

// Cooldown map to store the last execution time for each user
const cooldowns = new Map()
// Variable to store the last global execution time
let lastGlobalExecution = 0

export default new ClientEvent("messageCreate", async (message) => {
	if (message.attachments.size > 0) {
		for (const attachment of message.attachments.values()) {
			const contentType = attachment.contentType || attachment.name

			if (contentType.startsWith("audio") || /\.(mp3|wav|ogg|flac)$/i.test(contentType)) {
				await message.delete()
				return
			}
		}
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
