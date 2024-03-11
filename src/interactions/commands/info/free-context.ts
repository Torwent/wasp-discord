import { Command } from "$structures/Interactions"
import { supabase } from "$structures/Supabase"
import { ApplicationCommandType } from "discord.js"

export default new Command({
	name: "WaspScripts Free Access",
	type: ApplicationCommandType.User,
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
		const role = interaction.member.roles.cache.find(
			(r) =>
				r.name === "Tester" ||
				r.name === "Scripter" ||
				r.name === "Moderator" ||
				r.name === "Administrator"
		)

		if (role == null) {
			await interaction.editReply("You are not allowed to use this command.")
			return
		}

		let user = interaction.options.data[0].value as string

		if (user === "") {
			await interaction.editReply("Discord ID is empty.")
			return
		}

		const { data: userData, error: userError } = await supabase
			.schema("profiles")
			.from("profiles")
			.select("id")
			.eq("discord", user)
			.limit(1)
			.maybeSingle()

		if (userError) {
			console.error(userError)
			await interaction.editReply("WaspScripts ID not found.")
			return
		}

		if (userData == null) {
			await interaction.editReply("WaspScripts ID not found.")
			return
		}

		user = userData.id

		const { data: freeData, error: errorData } = await supabase
			.schema("profiles")
			.from("free_access")
			.select("product, date_start, date_end")
			.eq("id", user)

		if (errorData) {
			console.error(errorData)
			await interaction.editReply("Error trying to get user free access information.")
			return
		}

		if (freeData == null || freeData.length === 0) {
			await interaction.editReply("No free access information was found for this user.")
			return
		}

		const result = await Promise.all(
			freeData.map(async (access) => {
				const { data, error } = await supabase
					.schema("scripts")
					.from("products")
					.select("name")
					.eq("id", access.product)
					.maybeSingle()

				if (error) {
					console.error(error)
					await interaction.editReply(
						"Error trying to get product data for product: " + access.product
					)
					return
				}

				if (data == null) {
					await interaction.editReply("Error, no product data for product: " + access.product)
					return
				}

				return {
					name: data.name,
					product: access.product,
					date_start: access.date_start,
					date_end: access.date_end
				}
			})
		)

		let message = ""
		result.forEach((sub) => {
			message += `
			> Name: \`${sub.name}\`
			> Product: \`${sub.product}\`
			> Start: \`${sub.date_start}\`, End: \`${sub.date_end}\`\n\n`
		})

		await interaction.editReply(message)
	}
})
