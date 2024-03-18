import {
	type ApplicationCommandDataResolvable,
	Client,
	Events,
	GatewayIntentBits,
	ActivityType,
	Collection,
	type ClientEvents
} from "discord.js"
import { Glob } from "bun"
import type { Command, RegisterCommandsOptions } from "$lib/interaction"
import type { ClientEvent } from "$lib/event"

class ExtendedClient extends Client {
	commands: Collection<string, Command> = new Collection()

	async registerCommands({ commands, GUILD_ID }: RegisterCommandsOptions) {
		if (GUILD_ID) {
			this.guilds.cache.get(GUILD_ID)?.commands.set(commands)
			console.log(`Registering commands to ${GUILD_ID}`)
			return
		}

		this.application?.commands.set(commands)
		console.log("Registering global commands")
	}

	async registerModules() {
		// Commands
		const path = process.cwd() + "/src/interactions/commands/"
		const slashCommands: ApplicationCommandDataResolvable[] = []
		const files = new Glob("**/*{.ts,.js}")

		for await (const file of files.scan({ cwd: "./src/interactions/commands" })) {
			const command: Command = (await import(path + file))?.default
			if (!command.name) return
			console.log("Adding command: ", command.name)

			this.commands.set(command.name, command)

			slashCommands.push(command)
		}

		this.once(Events.ClientReady, async (bot) => {
			await this.registerCommands({
				commands: slashCommands,
				GUILD_ID: process.env.GUILD_ID
			})

			bot.user.setPresence({
				activities: [{ name: "OSRS with Simba", type: ActivityType.Playing }],
				status: "online"
			})

			console.log(`Ready! Logged in as ${bot.user.tag}`)
		})
	}

	async registerEvents() {
		const path = process.cwd() + "/src/events/"
		const files = new Glob("**/*{.ts,.js}")
		for await (const file of files.scan({ cwd: "./src/events" })) {
			const event: ClientEvent<keyof ClientEvents> = (await import(path + file))?.default
			this.on(event.event, event.run)
		}
	}

	async start() {
		await this.registerModules()
		await this.registerEvents()
		await this.login(process.env.BOT_TOKEN)
	}
}

export const client = new ExtendedClient({ intents: [GatewayIntentBits.Guilds, 32767] })
await client.start()
