import "./lib/alias"
import "$lib/env"
import {
	type ApplicationCommandDataResolvable,
	type ClientEvents,
	ActivityType,
	Client,
	Collection,
	GatewayIntentBits
} from "discord.js"
import { glob } from "glob"
import { Command } from "$lib/interaction"
import { ClientEvent } from "$lib/event"
import { databaseListen } from "$lib/supabase"

export class ExtendedClient extends Client {
	commands: Collection<string, Command> = new Collection()

	// Register modules (Commands, Buttons, Menus, Modals, ...)
	async registerModules() {
		const commands: ApplicationCommandDataResolvable[] = []

		const path = __dirname.replaceAll("\\", "/") + "/interactions/commands/"
		const files = await glob(path + "**/*{.ts,.js}")
		files.forEach(async (file) => {
			const imported = await import(file)
			if (!imported) return
			const command: Command = imported.default

			console.log("Adding command: ", command.name)
			this.commands.set(command.name, command)
			commands.push(command)
		})

		this.once("ready", async () => {
			const guild = process.env.GUILD_ID
			this.guilds.cache.get(guild).commands.set(commands)
			console.log("Registering commands to: " + guild)

			this.user.setPresence({
				activities: [{ name: "OSRS with Simba", type: ActivityType.Playing }],
				status: "online"
			})
			console.log(`Ready! Logged in as ${this.user.tag}`)
		})
	}

	async registerEvents() {
		const path = __dirname.replaceAll("\\", "/") + "/events/"
		const files = await glob(path + "**/*{.ts,.js}")
		files.forEach(async (file) => {
			const imported = await import(file)
			if (!imported) return
			const event: ClientEvent<keyof ClientEvents> = imported.default
			this.on(event.event, event.run)
			console.log("Listening to event: ", event.event)
		})
	}

	async start() {
		await databaseListen()
		await this.registerModules()
		await this.registerEvents()
		await this.login(process.env.BOT_TOKEN)
	}
}

export const client = new ExtendedClient({ intents: [GatewayIntentBits.Guilds, 32767] })
client.start()
