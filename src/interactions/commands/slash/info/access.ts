import { access } from "$lib/commands"
import type { Command } from "$lib/interaction"
import { ApplicationIntegrationType } from "discord.js"

const command: Command = {
	name: "access",
	description: "Gets the user subscriptions and free access information",
	integrationTypes: [ApplicationIntegrationType.GuildInstall, ApplicationIntegrationType.UserInstall],
	options: [{ type: 6, name: "user", description: "Discord user", required: true }],
	run: async ({ interaction }) => await access(interaction)
}

export default command
