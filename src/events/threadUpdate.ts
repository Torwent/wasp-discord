import { ClientEvent } from "$lib/event"
import { ForumChannel } from "discord.js"

export default new ClientEvent("threadUpdate", async (thread) => {
	const parent = thread.parent as ForumChannel
	if (parent.name !== "👋help") return

	const solved = parent.availableTags.find((tag) => tag.name === "solved")

	const updatedThread = parent.threads.cache.get(thread.id)
	const newTags = updatedThread.appliedTags.find((tag) => !thread.appliedTags.includes(tag))

	if (newTags !== solved.id) return

	await thread.setAppliedTags([solved.id])
	await thread.setLocked(true)
	await thread.setArchived(true)
})
