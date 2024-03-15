import {
	Client,
	Events,
	GatewayIntentBits,
	type ApplicationCommandDataResolvable
} from "discord.js"
import { Glob } from "bun"
import type { CommandType } from "$lib/interaction"

export const client = new Client({ intents: [GatewayIntentBits.Guilds] })

async function registerModules() {
	// Commands
	const slashCommands: ApplicationCommandDataResolvable[] = []
	const files = new Glob("**/*{.ts,.js}")

	for await (const file of files.scan({ cwd: "./src/interactions/commands" })) {
		console.log(file) // => "index.ts"

		const command: CommandType = (await import(file))?.default
		if (!command.name) return
		console.log("Adding command: ", command.name)

		slashCommands.push(command)
	}

	/* commandFiles.forEach(async (filePath) => {
		
	}) */
}

client.once(Events.ClientReady, (bot) => {
	console.log(`Ready! Logged in as ${bot.user.tag}`)
})

client.login(process.env.BOT_TOKEN)
await registerModules()
