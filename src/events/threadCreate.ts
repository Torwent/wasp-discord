import { ClientEvent } from "$lib/event"
import { ForumChannel } from "discord.js"

export default new ClientEvent("threadCreate", async (thread) => {
	const parent = thread.parent as ForumChannel
	if (parent.name !== "👋help") return

	const suggestion = parent.availableTags.find((tag) => tag.name === "suggestion")

	if (thread.appliedTags.includes(suggestion.id)) return

	const unsolved = parent.availableTags.find((tag) => tag.name === "unsolved")

	await thread.setAppliedTags([...thread.appliedTags, unsolved.id])
})
