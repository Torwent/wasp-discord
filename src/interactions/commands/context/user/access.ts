import type { Command } from "$lib/interaction"
import { getRole } from "$lib/lib"
import { getWSID, supabase } from "$lib/supabase"
import { ApplicationCommandType } from "discord.js"

const command: Command = {
	name: "WaspScripts Access",
	type: ApplicationCommandType.User,
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

		user = await getWSID(user)
		if (!user) {
			await interaction.editReply("WaspScripts ID not found.")
			return
		}

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
				.eq("id", user),
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

		for (let i = 0; i < promises.length; i++) {
			let errorMsg = "Error trying to get:"
			if (promises[i].error) {
				console.error(promises[i].error)
				switch (i) {
					case 0:
						errorMsg += " subscriptions "
						break
					case 1:
						errorMsg += " free_access "
						break

					case 2:
						errorMsg += " old_subscriptions "
						break
					case 3:
						errorMsg += "old_free_access "
						break
				}
			}

			if (errorMsg !== "Error trying to get:") {
				await interaction.editReply(errorMsg + ".")
				return
			}
		}

		const { data: subData } = promises[0]
		const { data: freeData } = promises[1]
		const { data: old_subData } = promises[2]
		const { data: old_freeData } = promises[3]

		if (
			subData.length === 0 &&
			freeData.length === 0 &&
			old_subData.length === 0 &&
			old_freeData.length === 0
		) {
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

		const old_subscriptions = await Promise.all(
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

		const old_free_access = await Promise.all(
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
			message += "\n### Subscriptions:\n```\n"

			for (let i = 0; i < subscriptions.length; i++) {
				const sub = subscriptions[i]
				message += "Name        : " + sub.name + "\n"
				message += "Product     : " + sub.product + "\n"
				message += "Subscription: " + sub.subscription + "\n"
				message +=
					"Start: " +
					new Date(sub.date_start).toLocaleString("PT-pt") +
					" End: " +
					new Date(sub.date_end).toLocaleString("PT-pt") +
					", Cancel: " +
					sub.cancel
				if (i < subscriptions.length) message += "\n\n"
			}
			message += "```"
		}

		if (free_access.length) {
			message += "\n### Free Access:\n```\n"

			for (let i = 0; i < free_access.length; i++) {
				const access = free_access[i]
				message += "Name   : " + access.name + "\n"
				message += "Product: " + access.product + "\n"
				message +=
					"Start: " +
					new Date(access.date_start).toLocaleString("PT-pt") +
					", End: " +
					new Date(access.date_end).toLocaleString("PT-pt")
				if (i < subscriptions.length) message += "\n\n"
			}
			message += "```"
		}

		if (old_subscriptions.length) {
			message += "\n### Old Subscriptions:\n```\n"

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

		if (old_free_access.length) {
			message += "\n### Old Free Access:\n```\n"

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

		if (message === "") message = "User has no subscription nor free access data"

		await interaction.editReply(message)
	}
}

export default command
