import { access } from "$lib/commands"
import type { Command } from "$lib/interaction"
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from "discord.js"

const command: Command = {
	name: "WaspScripts Access",
	type: ApplicationCommandType.User,
	integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	contexts: [InteractionContextType.Guild, InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
	run: async ({ interaction }) => await access(interaction)
}

export default command
