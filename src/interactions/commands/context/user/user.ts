import type { Command } from "$lib/interaction"
import { getRole } from "$lib/lib"
import { supabase } from "$lib/supabase"
import { ApplicationCommandType } from "discord.js"

const command: Command = {
	name: "User information",
	type: ApplicationCommandType.User,
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
		const roles = interaction.member.roles.cache
		const role = getRole(interaction.member, ["Scripter", "Moderator", "Administrator"])

		if (role == null) {
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
