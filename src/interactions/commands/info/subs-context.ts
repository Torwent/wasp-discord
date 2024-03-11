import { Command } from "$structures/Interactions"
import { supabase } from "$structures/Supabase"
import { ApplicationCommandType, PermissionFlagsBits } from "discord.js"

export default new Command({
	name: "WaspScripts Subscriptions",
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

		const { data: subData, error: errorData } = await supabase
			.schema("profiles")
			.from("subscription")
			.select("product, subscription, date_start, date_end, cancel")
			.eq("id", user)

		if (errorData) {
			console.error(errorData)
			await interaction.editReply("Error trying to get user subscriptions.")
			return
		}

		if (subData == null || subData.length === 0) {
			await interaction.editReply("No subscriptions were found for this user.")
			return
		}

		const result = await Promise.all(
			subData.map(async (sub) => {
				const { data, error } = await supabase
					.schema("scripts")
					.from("products")
					.select("name")
					.eq("id", sub.product)
					.maybeSingle()

				if (error) {
					console.error(error)
					await interaction.editReply(
						"Error trying to get product data for product: " + sub.product
					)
					return
				}

				if (data == null) {
					await interaction.editReply("Error, no product data for product: " + sub.product)
					return
				}

				return {
					name: data.name,
					product: sub.product,
					subscription: sub.subscription,
					date_start: sub.date_start,
					date_end: sub.date_end,
					cancel: sub.cancel
				}
			})
		)

		let message = ""
		result.forEach((sub) => {
			message += `
			> Name: \`${sub.name}\`
			> Product: \`${sub.product}\`, Subscription: \`${sub.subscription}\`
			> Start: \`${sub.date_start}\`, End: \`${sub.date_end}\`, Cancel: \`${sub.cancel}\`\n\n`
		})

		await interaction.editReply(message)
	}
})
