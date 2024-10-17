import type { Command } from "$lib/interaction"
import { supabase } from "$lib/supabase"
import { ApplicationIntegrationType, InteractionContextType } from "discord.js"

const command: Command = {
	name: "wsid",
	description: "Gets the user waspscripts id",
	integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	contexts: [InteractionContextType.Guild,InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
	options: [{ type: 6, name: "user", description: "Discord user", required: true }],
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
