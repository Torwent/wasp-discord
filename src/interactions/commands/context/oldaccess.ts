import type { Command } from "$lib/interaction"
import { supabase } from "$lib/supabase"
import { ApplicationCommandType } from "discord.js"

const command: Command = {
	name: "WaspScripts Previous Access",
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

		const promises = await Promise.all([
			supabase
				.schema("profiles")
				.from("subscriptions_old")
				.select("product, subscription, date_start, date_end, cancel")
				.eq("id", user),
			supabase
				.schema("profiles")
				.from("free_access_old")
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
			message += "### Old Subscriptions:\n```\n"

			for (let i = 0; i < subscriptions.length; i++) {
				const sub = subscriptions[i]
				message += "Name        : " + sub?.name + "\n"
				message += "Product     : " + sub?.product + "\n"
				message += "Subscription: " + sub?.subscription + "\n"
				message +=
					"Start: " +
					new Date(sub.date_start).toLocaleString("PT-pt") +
					" End: " +
					new Date(sub.date_end).toLocaleString("PT-pt") +
					", Cancel: " +
					sub?.cancel
				if (i < subscriptions.length) message += "\n\n"
			}
			message += "```"
		}

		if (free_access.length) {
			if (subscriptions.length > 0) message += "\n"
			message += "### Old Free Access:\n```\n"

			for (let i = 0; i < free_access.length; i++) {
				const access = free_access[i]
				message += "Name   : " + access?.name + "\n"
				message += "Product: " + access?.product + "\n"
				message +=
					"Start: " +
					new Date(access.date_start).toLocaleString("PT-pt") +
					", End: " +
					new Date(access.date_end).toLocaleString("PT-pt")
				if (i < subscriptions.length) message += "\n\n"
			}
			message += "```"
		}

		await interaction.editReply(message)
	}
}

export default command
