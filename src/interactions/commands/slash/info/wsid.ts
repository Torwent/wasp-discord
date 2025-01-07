import { wsid } from "$lib/commands"
import type { Command } from "$lib/interaction"
import { supabase } from "$lib/supabase"
import { ApplicationIntegrationType, InteractionContextType, SlashCommandBuilder } from "discord.js"

const command: Command = {
	name: "wsid",
	description: "Gets the user waspscripts id",
	integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	contexts: [InteractionContextType.Guild,InteractionContextType.BotDM, InteractionContextType.PrivateChannel],
	options: [{ type: 6, name: "user", description: "Discord user", required: true }],
	run: async ({ interaction }) => await wsid(interaction)
}

export default command
