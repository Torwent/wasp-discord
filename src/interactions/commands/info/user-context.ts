import { Command } from "$structures/Interactions"
import { supabase } from "$structures/Supabase"
import { ApplicationCommandType } from "discord.js"

export default new Command({
	name: "User information",
	type: ApplicationCommandType.User,
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
				"id, customer_id, private!private_id_fkey (email), roles!roles_id_fkey (premium, vip, tester, scripter, moderator, administrator)"
			)
			.eq("discord", user)
			.limit(1)
			.limit(1, { foreignTable: "private" })
			.limit(1, { foreignTable: "roles" })
			.maybeSingle()

		if (error) {
			console.error(error)
			await interaction.editReply("WaspScripts ID not found.")
			return
		}

		if (data == null) {
			await interaction.editReply("WaspScripts ID not found.")
			return
		}

		let rolesData: string
		if (data.roles.premium) rolesData += "Premium "
		if (data.roles.vip) rolesData += "VIP "
		if (data.roles.tester) rolesData += "Tester "
		if (data.roles.scripter) rolesData += "Scripter "
		if (data.roles.moderator) rolesData += "Moderator "
		if (data.roles.administrator) rolesData += "Administrator"

		let message =
			"WSID: `" + data.id + "`, Discord ID: `" + user + "`, Customer ID: `" + data.customer_id + "`"

		if (roles.find((r) => r.name === "Administrator"))
			message += ", Email: `" + data.private.email + "`"

		message += "\nRoles: `" + rolesData + "`"

		await interaction.editReply(message)
	}
})
