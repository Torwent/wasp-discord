import { Command } from "$structures/Interactions"
import { supabase } from "$structures/Supabase"
import { ApplicationCommandType } from "discord.js"

export default new Command({
	name: "User information",
	defaultMemberPermissions: ["Administrator", "ModerateMembers"],
	type: ApplicationCommandType.User,
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
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

		let roles: string
		if (data.roles.premium) roles += "Premium "
		if (data.roles.vip) roles += "VIP "
		if (data.roles.tester) roles += "Tester "
		if (data.roles.scripter) roles += "Scripter "
		if (data.roles.moderator) roles += "Moderator "
		if (data.roles.administrator) roles += "Administrator"

		const message = `
			WSID: \`${data.id}\`, Discord ID: \`${user}\`, Customer ID: \`${data.customer_id}\`, Email: \`${data.private.email}\`\nRoles: \`${roles}\``

		await interaction.editReply(message)
	}
})
