import { Events } from "discord.js"
import { ExtendedClient } from "$structures/Client"
import { isLoggedIn, login, supabase } from "$structures/Supabase"
import { addNewUser, isUserModified } from "$structures/users"
import { Profile } from "$lib/types/collection"

export const ROLES =
	process.env.ENVIRONMENT === "production"
		? {
				administrator: "816271648118013953",
				moderator: "1018906735123124315",
				scripter: "1069140447647240254",
				tester: "907209408860291113",
				vip: "931167526681972746",
				premium: "820985772140134440",
				timeout: "1102052216157786192"
		  }
		: {
				administrator: "1067734814796550181",
				moderator: "1067734814796550180",
				scripter: "1115527233277272116",
				tester: "1067734814796550179",
				vip: "1067734814796550178",
				premium: "1067734814796550177",
				timeout: "1115527081745465375"
		  }

export const roleListen = async (client: ExtendedClient) => {
	console.log("Listening for role changes!")
	await login(client)

	client.on(Events.GuildMemberUpdate, async (user) => {
		if (await isUserModified(user.id)) {
			console.log("Discord - User with ID: ", user.id, " was recently modified.")
			return
		}

		const updatedUser = user.guild.members.cache.get(user.id)
		const roles = updatedUser.roles.cache

		const loggedIn = await isLoggedIn()
		if (!loggedIn) await login(client)

		console.log("Updating user: ", user.id)

		const { data, error: IDError } = await supabase
			.schema("profiles")
			.from("profiles")
			.select(
				`id, roles!left (moderator, scripter, tester, vip, premium, timeout), subscriptions!left (external)`
			)
			.eq("discord", user.id)
			.limit(1)
			.limit(1, { foreignTable: "roles" })
			.limit(1, { foreignTable: "subscriptions" })
			.returns<Profile[]>()

		if (IDError) return console.error(IDError)

		if (data.length === 0) return console.error("Data of " + user.id + " has 0 length")

		const {
			id,
			subscriptions: { external }
		} = data[0]

		const roleObject = external
			? {
					moderator: roles.has(ROLES.moderator),
					scripter: roles.has(ROLES.scripter),
					tester: roles.has(ROLES.tester),
					vip: roles.has(ROLES.vip),
					premium: roles.has(ROLES.premium),
					timeout: roles.has(ROLES.timeout)
			  }
			: {
					moderator: roles.has(ROLES.moderator),
					scripter: roles.has(ROLES.scripter),
					tester: roles.has(ROLES.tester),
					timeout: roles.has(ROLES.timeout)
			  }

		const { error } = await supabase
			.schema("profiles")
			.from("roles")
			.update(roleObject)
			.eq("id", id)

		await addNewUser(user.id, 2 * 60)

		if (error) {
			console.error(error)
			return
		}
	})
}
