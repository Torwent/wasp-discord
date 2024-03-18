import { ClientEvent } from "$lib/event"
import { supabase } from "$lib/supabase"

const discordRoles = {
	administrator: "816271648118013953",
	moderator: "1018906735123124315",
	scripter: "1069140447647240254",
	tester: "907209408860291113",
	vip: "1193104319122260018",
	premium: "1193104090264252448",
	timeout: "1102052216157786192"
}

export default new ClientEvent("guildMemberUpdate", async (user) => {
	console.log("Discord user ", user.id, " roles changed.")
	const roles = user.roles.cache
	const { data, error: userError } = await supabase
		.schema("profiles")
		.from("profiles")
		.select("id, roles(moderator, scripter, tester, timeout)")
		.eq("discord", user.id)
		.limit(1)
		.limit(1, { foreignTable: "roles" })
		.single()

	if (userError) {
		console.error(userError)
		return
	}

	const dbRoles = data.roles
	if (dbRoles == null) {
		console.error("User doesn't seem to have a roles entry.")
		return
	}

	const { id } = data

	const roleObject = {
		moderator: roles.has(discordRoles.moderator),
		scripter: roles.has(discordRoles.scripter),
		tester: roles.has(discordRoles.tester),
		timeout: roles.has(discordRoles.timeout)
	}

	const { error } = await supabase.schema("profiles").from("roles").update(roleObject).eq("id", id)

	if (error) {
		console.error(error)
		return
	}
})
