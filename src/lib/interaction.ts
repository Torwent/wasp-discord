import type {
	Client,
	ApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver
} from "discord.js"

interface CommandRunOptions {
	client: Client
	interaction: CommandInteraction
	args: CommandInteractionOptionResolver
}

type CommandRunFunction = (options: CommandRunOptions) => any

export type CommandType = {
	run: CommandRunFunction
} & ApplicationCommandData

export class Command {
	constructor(commandOptions: CommandType) {
		Object.assign(this, commandOptions)
	}
}
