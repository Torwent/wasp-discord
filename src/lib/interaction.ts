import type {
	Client,
	ApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	ApplicationCommandDataResolvable,
	ButtonInteraction
} from "discord.js"
import { ExtendedClient } from "src"

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

export interface ButtonInteractionEx extends ButtonInteraction {
	member: GuildMember
}

export type Button = ApplicationCommandData & {
	roles?: string[]
	run: (options: {
		client: ExtendedClient
		member: GuildMember
		interaction: ButtonInteractionEx
	}) => void
}
