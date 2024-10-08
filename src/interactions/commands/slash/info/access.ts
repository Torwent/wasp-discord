import type { Command } from "$lib/interaction"
import { getRole } from "$lib/lib"
import { supabase } from "$lib/supabase"

const command: Command = {
	name: "access",
	description: "Gets the user subscriptions and free access information",
	options: [{ type: 6, name: "user", description: "Discord user", required: true }],
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true }).catch(err => console.error(err))

		const role = getRole(interaction.member, ["Tester", "Scripter", "Moderator", "Administrator"])

		if (role == null) {
			await interaction.editReply("You are not allowed to use this command.").catch(err => console.error(err))
			return
		}

		let user = interaction.options.data[0].value as string

		if (user === "") {
			await interaction.editReply("Discord ID is empty.").catch(err => console.error(err))
			return
		}

		const { data: userData, error: userError } = await supabase
			.schema("profiles")
			.from("profiles")
			.select("id, username")
			.eq("discord", user)
			.limit(1)
			.maybeSingle()

		if (userError) {
			console.error(userError)
			await interaction.editReply("WaspScripts ID not found.").catch(err => console.error(err))
			return
		}

		if (userData == null) {
			await interaction.editReply("WaspScripts ID not found.").catch(err => console.error(err))
			return
		}

		user = userData.id

		const promises = await Promise.all([
			supabase
				.schema("profiles")
				.from("subscription")
				.select("product, subscription, date_start, date_end, cancel")
				.eq("id", user),
			supabase
				.schema("profiles")
				.from("free_access")
				.select("product, date_start, date_end")
				.eq("id", user)
		])

		const { data: subData, error: subsError } = promises[0]
		const { data: freeData, error: freeError } = promises[1]

		if (subsError || freeError) {
			let response: string
			if (subsError && freeError) {
				console.error(freeError)
				console.error(subsError)
				response = "Error trying to get user subscriptions and free access."
			} else if (subsError) {
				console.error(subsError)
				response = "Error trying to get user subscriptions."
			} else {
				console.error(freeError)
				response = "Error trying to get user free access."
			}

			await interaction.editReply(response).catch(err => console.error(err))
			return
		}

		if ((subData == null || subData.length === 0) && (freeData == null || freeData.length === 0)) {
			await interaction.editReply("No subscriptions or free access data was found for this user.").catch(err => console.error(err))
			return
		}

		const subscriptions = await Promise.all(
			subData.map(async (sub) => {
				const { data, error } = await supabase
					.schema("scripts")
					.from("products")
					.select("name")
					.eq("id", sub.product)
					.single()

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
					date_start: new Date(sub.date_start).toLocaleString("PT-pt").split(",")[0].trim(),
					date_end: new Date(sub.date_end).toLocaleString("PT-pt").split(",")[0].trim(),
					cancel: sub.cancel
				}
			})
		)

		const free_access = await Promise.all(
			freeData.map(async (access) => {
				const { data, error } = await supabase
					.schema("scripts")
					.from("products")
					.select("name")
					.eq("id", access.product)
					.single()

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
					date_start: new Date(access.date_start).toLocaleString("PT-pt").split(",")[0].trim(),
					date_end: new Date(access.date_end).toLocaleString("PT-pt").split(",")[0].trim()
				}
			})
		)

		let message = "```\n"

		if (subscriptions.length > 0) {
			message += "Subscriptions:\n"

			for (let i = 0; i < subscriptions.length; i++) {
				const sub = subscriptions[i]
				message += "Name: " + sub.name + " Product: " + sub.product + " Subscription: " + sub.subscription + "\n"
				message += "From: " + sub.date_start + " To: " + sub.date_end + " Cancel: " + sub.cancel
				message += "\n"
			}
			message += "\n"
		}

		if (free_access.length > 0) {
			message += "Free Access:\n"

			for (let i = 0; i < free_access.length; i++) {
				const access = free_access[i]
				message += "Name: " + access.name + " Product: " + access.product + " From: " + access.date_start + " To: " + access.date_end
				if (i < subscriptions.length) message += "\n"
			}
			message += "\n"
		}

		if (message.length > 1990) message = message.substring(0, 1990) + "\n...\n"
		message += "```"

		await interaction.editReply(message).catch(err => console.error(err))
	}
}

export default command
