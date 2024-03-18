import type {
	Client,
	ApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	ApplicationCommandDataResolvable
} from "discord.js"

export interface RegisterCommandsOptions {
	GUILD_ID?: string
	commands: ApplicationCommandDataResolvable[]
}

export interface CommandExtendedInteraction extends CommandInteraction {
	member: GuildMember
}

interface CommandRunOptions {
	client: Client
	interaction: CommandExtendedInteraction
	args: CommandInteractionOptionResolver
}

type CommandRunFunction = (options: CommandRunOptions) => any

export type Command = {
	run: CommandRunFunction
} & ApplicationCommandData
