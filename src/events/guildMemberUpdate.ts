import { ClientEvent } from "$lib/event"
import { supabase } from "$lib/supabase"

const discordRoles = {
	moderator: "1018906735123124315",
	scripter: "1069140447647240254",
	tester: "907209408860291113",
	timeout: "1102052216157786192"
}

export default new ClientEvent("guildMemberUpdate", async (user) => {
	const member = await user.guild.members.fetch({ user: user.id, force: true })
	const roles = member.roles.cache

	const { data, error: userError } = await supabase
		.schema("profiles")
		.from("profiles")
		.select("id, roles!profiles_id_fkey2 (moderator, scripter, tester, timeout)")
		.eq("discord", user.id)
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

	if (
		data.roles.moderator === roleObject.moderator &&
		data.roles.scripter === roleObject.scripter &&
		data.roles.tester === roleObject.tester &&
		data.roles.timeout === roleObject.timeout
	) {
		return
	}
	console.log("Discord user ", user.id, " roles changed: ", roleObject)
	const { error } = await supabase.schema("profiles").from("roles").update(roleObject).eq("id", id)

	if (error) {
		console.error(error)
		return
	}
})
