import type { Command } from "$lib/interaction"
import { supabase } from "$lib/supabase"
import { ApplicationCommandType } from "discord.js"

const recentUsers = new Set()
const minutes = 5

let response: string | null = null

const command: Command = {
	name: "Quick Help",
	type: ApplicationCommandType.Message,
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
		const caller = interaction.member
		const role = caller.roles.cache.find(
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

		if (recentUsers.has(caller.id)) {
			await interaction.editReply(
				"You can't use this command more than once every " + minutes + " minutes."
			)
			return
		}

		const message = interaction.options.data[0]
		const user = message.message.author.id

		if (user === "") {
			await interaction.editReply("Discord ID is empty.")
			return
		}

		if (!response) {
			console.log("Fetching canned response from DB.")
			const { data, error } = await supabase
				.schema("info")
				.from("discord")
				.select("response")
				.eq("id", "58ad4b5b-0109-42d3-aa1b-ef035ceb77eb")
				.single()

			if (error) {
				console.error(error)
				await interaction.editReply(
					"Failed to get canned response from DB:\n```json\n" + JSON.stringify(error) + "\n```"
				)
				return
			}

			response = data.response
		}

		message.message.reply("Hello <@" + user + ">!\n\n" + response)
		await interaction.editReply("The user has been messaged.")

		recentUsers.add(caller.id)
		setTimeout(() => {
			recentUsers.delete(caller.id)
		}, 600000 * minutes)
	}
}

export default command
