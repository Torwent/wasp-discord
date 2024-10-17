import type { Command } from "$lib/interaction"
import { getWSID, supabase } from "$lib/supabase"
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from "discord.js"

const command: Command = {
	name: "WaspScripts ID",
	type: ApplicationCommandType.User,
	integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	contexts: [InteractionContextType.Guild,InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
		const user = interaction.options.data[0].value as string

		if (user === "") {
			await interaction.editReply("Discord ID is empty.")
			return
		}

		const id = await getWSID(user)

		await interaction.editReply(id)
	}
}

export default command
