import type { Command } from "$lib/interaction"
import { supabase } from "$lib/supabase"
import { ApplicationCommandType } from "discord.js"

const command: Command = {
	name: "WaspScripts ID",
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
			.select("id")
			.eq("discord", user)
			.limit(1)
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

		await interaction.editReply(data.id)
	}
}

export default command
