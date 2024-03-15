import { Events } from "discord.js"
import { ExtendedClient } from "$structures/Client"
import { listenToDB, supabase } from "$structures/Supabase"
import { addNewUser, isUserModified } from "$structures/users"
import { Profile } from "$lib/types/collection"

export const ROLES =
	process.env.ENVIRONMENT === "production"
		? {
				administrator: "816271648118013953",
				moderator: "1018906735123124315",
				scripter: "1069140447647240254",
				tester: "907209408860291113",
				vip: "1193104319122260018",
				premium: "1193104090264252448",
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
	await listenToDB(client)

	client.on(Events.GuildMemberUpdate, async (user) => {
		if (await isUserModified(user.id)) {
			console.log("Discord - User with ID: ", user.id, " was recently modified.")
			return
		}

		const updatedUser = user.guild.members.cache.get(user.id)
		const roles = updatedUser.roles.cache

		console.log("Updating user discord side: ", user.id)

		const { data, error: IDError } = await supabase
			.schema("profiles")
			.from("profiles")
			.select(`id, roles!left (moderator, scripter, tester, timeout)`)
			.eq("discord", user.id)
			.limit(1)
			.limit(1, { foreignTable: "roles" })
			.returns<Profile[]>()

		if (IDError) return console.error(IDError)
		if (data.length === 0) return console.error("Data of " + user.id + " has 0 length")

		const { id } = data[0]

		const roleObject = {
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

		await addNewUser(user.id, 3 * 60)

		if (error) {
			console.error(error)
			return
		}
	})
}
