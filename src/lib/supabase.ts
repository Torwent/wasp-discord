import { RealtimeChannel, createClient } from "@supabase/supabase-js"
import type { Database } from "./types/supabase"
import { client } from ".."

const options = { auth: { persistSession: false } }
export const supabase = createClient<Database>(process.env.SB_URL, process.env.SERVICE_KEY, options)

const discordRoles = {
	administrator: "816271648118013953",
	moderator: "1018906735123124315",
	scripter: "1069140447647240254",
	tester: "907209408860291113",
	vip: "1193104319122260018",
	premium: "1193104090264252448",
	timeout: "1102052216157786192"
}

export async function databaseListen() {
	console.log("Listening to supabase roles table changes")

	const guild = client.guilds.cache.get(process.env.GUILD_ID)
	if (guild == null) return

	supabase
		.channel("profiles-roles-changes-discord")
		.on(
			"postgres_changes",
			{ event: "UPDATE", schema: "profiles", table: "roles" },
			async (payload) => {
				const id = payload.new.id as string
				const roles = payload.new.roles
				console.log("Database user ", id, " roles changed: ", JSON.stringify(roles))

				const { data, error } = await supabase
					.schema("profiles")
					.from("profiles")
					.select("discord")
					.limit(1)
					.eq("id", id)
					.single()

				if (error) {
					console.error(error)
					return
				}

				const discord = data.discord

				console.log("Updating user database side: ", discord)

				const member = guild.members.cache.get(discord)

				if (member) {
					Object.keys(discordRoles).forEach((key) => {
						if (key === "premium" || key === "vip" || key === "scripter" || key === "timeout") {
							if (payload.new[key]) member.roles.add(discordRoles[key])
							else member.roles.remove(discordRoles[key])
						}
					})
				}
			}
		)
		.subscribe()
}
