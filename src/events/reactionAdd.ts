import { ClientEvent } from "$lib/event"

const discordRoles = {
	moderator: "1018906735123124315",
	scripter: "1069140447647240254",
	tester: "907209408860291113"
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

	reactions.forEach(async (r) => {
		if (!emojis.includes(r.emoji.name)) return
		const users = r.users
		users.cache.forEach(async (u) => {
			if (scripterVoters.includes(u.id)) return
			if (testerVoters.includes(u.id)) return

			const member = await guild.members.fetch({ user: u.id })
			if (member.roles.cache.find((r) => r.id === discordRoles.scripter)) {
				scripterVoters.push(u.id)
				return
			}
			if (member.roles.cache.find((r) => r.id === discordRoles.tester)) {
				scripterVoters.push(u.id)
				return
			}
		})
	})

	if (scripterVoters.length + testerVoters.length > 4)
		message.reply("This message should be deleted. This is being tested for now.")

	return
})
