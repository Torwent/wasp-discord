import type { Command } from "$lib/interaction"
import { supabase } from "$lib/supabase"

const command: Command = {
	name: "user",
	description: "Gets the waspscripts user info",
	options: [{ type: 6, name: "user", description: "Discord user", required: true }],
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
		const roles = interaction.member.roles.cache
		const hasRole = roles.find(
			(r) => r.name === "Scripter" || r.name === "Moderator" || r.name === "Administrator"
		)

		if (hasRole == null) {
			await interaction.editReply("You are not allowed to use this command.")
			return
		}

		const user = interaction.options.data[0].value as string

		if (user === "") {
			await interaction.editReply("Discord ID is empty.")
			return
		}

		const { data, error } = await supabase
			.schema("profiles")
			.from("profiles")
			.select(
				"id, customer_id, private!profiles_id_fkey (email), roles!profiles_id_fkey (premium, vip, tester, scripter, moderator, administrator)"
			)
			.eq("discord", user)
			.limit(1)
			.single()

		if (error) {
			await interaction.editReply("Database error: \n```\n" + JSON.stringify(error) + "```")
			return
		}

		const rolesData = data.roles

		let rolesString = ""
		Object.entries(rolesData).forEach((entry) => {
			if (entry[1]) rolesString += entry[0] + " "
		})

		let message = "```\n"
		message += "Wasp ID   : " + data.id + "\n"
		message += "Discord ID: " + user + "\n"
		message += "Stripe ID : " + data.customer_id + "\n"

		if (roles.find((r) => r.name === "Administrator"))
			message += "Email     : " + data.private.email + "\n"
		message += "\n"

		message += "Roles: " + rolesString + "\n"
		message += "```"

		await interaction.editReply(message)
	}
}

export default command
