import { ClientEvent } from "$lib/event"

const discordRoles = {
	moderator: "1018906735123124315",
	scripter: "1069140447647240254", //"1115527233277272116",
	tester: "907209408860291113" //"1067734814796550179"
}

const limit = 5

export default new ClientEvent("messageReactionAdd", async (reaction) => {
	if (reaction.partial) {
		try {
			await reaction.fetch()
		} catch (error) {
			console.error("Something went wrong when fetching the reaction:", error)
			// Return as `reaction.message.author` may be undefined/null
			return
		}
	}

	const message = reaction.message
	const guild = message.guild

	if (message.partial) {
		try {
			await message.fetch()
		} catch (error) {
			console.error("Something went wrong when fetching the message:", error)
			// Return as `reaction.message.author` may be undefined/null
			return
		}
	}

	let scripterVoters: string[] = []
	let testerVoters: string[] = []
	const emojis = ["⬇️", "👎", "🤡"]
	const reactions = message.reactions.cache

	// Collect all promises for reactions processing
	const reactionPromises = reactions.map(async (r) => {
		if (!emojis.includes(r.emoji.name)) return

		const users = await r.users.fetch()

		// Collect promises for each user processing
		const userPromises = users.map(async (user) => {
			if (scripterVoters.includes(user.id)) return
			if (testerVoters.includes(user.id)) return

			const member = await guild.members.fetch({ user: user.id })

			if (member.roles.cache.some((role) => role.id === discordRoles.scripter)) {
				scripterVoters.push(user.id)
				return
			}

			if (member.roles.cache.some((role) => role.id === discordRoles.tester)) {
				testerVoters.push(user.id)
				return
			}
		})

		await Promise.all(userPromises)
	})

	await Promise.all(reactionPromises)

	if (scripterVoters.length + testerVoters.length > 4)
		message.reply("This message should be deleted. This is being tested for now.")

	return
})
