import { wsid } from "$lib/commands"
import type { Command } from "$lib/interaction"
import { getWSID } from "$lib/supabase"
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from "discord.js"

const command: Command = {
	name: "WaspScripts ID",
	type: ApplicationCommandType.User,
	integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	contexts: [InteractionContextType.Guild,InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
	run: async ({ interaction }) => await wsid(interaction)
}

export default command
