import type { Command } from "$lib/interaction"
import { getRole } from "$lib/lib"
import { supabase } from "$lib/supabase"

const command: Command = {
	name: "access",
	description: "Gets the user subscriptions and free access information",
	options: [{ type: 6, name: "user", description: "Discord user", required: true }],
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })

		const role = getRole(interaction.member, ["Tester", "Scripter", "Moderator", "Administrator"])

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
			.select("id, username")
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

			await interaction.editReply(response)
			return
		}

		if ((subData == null || subData.length === 0) && (freeData == null || freeData.length === 0)) {
			await interaction.editReply("No subscriptions or free access data was found for this user.")
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
					date_start: sub.date_start,
					date_end: sub.date_end,
					cancel: sub.cancel
				}
			})
		)

		const free_access = await Promise.all(
			freeData.map(async (sub) => {
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
					date_start: sub.date_start,
					date_end: sub.date_end
				}
			})
		)

		let message = ""

		if (subscriptions.length) {
			message += "### Subscriptions:\n```\n"

			for (let i = 0; i < subscriptions.length; i++) {
				const sub = subscriptions[i]
				message += "Name        : " + sub?.name + "\n"
				message += "Product     : " + sub?.product + "\n"
				message += "Subscription: " + sub?.subscription + "\n"
				message +=
					"Start: " + sub?.date_start + " End: " + sub?.date_end + ", Cancel: " + sub?.cancel
				if (i < subscriptions.length) message += "\n\n"
			}
			message += "```"
		}

		if (free_access.length) {
			if (subscriptions.length > 0) message += "\n"
			message += "### Free Access:\n```\n"

			for (let i = 0; i < free_access.length; i++) {
				const access = free_access[i]
				message += "Name   : " + access?.name + "\n"
				message += "Product: " + access?.product + "\n"
				message += "Start: " + access?.date_start + ", End: " + access?.date_end
				if (i < subscriptions.length) message += "\n\n"
			}
			message += "```"
		}

		if (message.length > 1999) message = message.substring(0, 1999);
		await interaction.editReply(message)
	}
}

export default command
