import { ClientEvent } from "$lib/event"

export default new ClientEvent("threadUpdate", async (thread) => {
	console.log(thread.appliedTags)
})
