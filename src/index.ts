import "./lib/alias"
import "$lib/env"
import {
	type ApplicationCommandDataResolvable,
	type ClientEvents,
	ActivityType,
	Client,
	Collection,
	GatewayIntentBits,
	Partials
} from "discord.js"
import { glob } from "glob"
import { Command } from "$lib/interaction"
import { ClientEvent } from "$lib/event"
import { supabase } from "$lib/supabase"

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
			const guildStr = process.env.GUILD_ID
			const guild = this.guilds.cache.get(guildStr)
			guild.commands.set(commands)
			console.log("Registering commands to: " + guild.id)

			this.user.setPresence({
				activities: [{ name: "OSRS with Simba", type: ActivityType.Playing }],
				status: "online"
			})

			console.log(`Ready! Logged in as ${this.user.tag}`)

			const discordRoles = {
				scripter: "1069140447647240254",
				vip: "1193104319122260018",
				premium: "1193104090264252448"
			}

			supabase
				.channel("profiles-roles-changes-discord")
				.on(
					"postgres_changes",
					{ event: "UPDATE", schema: "profiles", table: "roles" },
					async (payload) => {
						const id = payload.new.id as string
						const { premium, vip, scripter } = payload.new
						const roles = { premium: premium, vip: vip, scripter: scripter }

						console.log("Database user ", id, " roles changed: ", roles)

						const { data, error } = await supabase
							.schema("profiles")
							.from("profiles")
							.select("discord")
							.limit(1)
							.eq("id", id)
							.single()

						if (error) {
							console.error(error)
							return
						}

						const discord = data.discord
						const member = guild.members.cache.get(discord)

						if (!member) {
							console.log("User ", discord, " not found on the server!")
							return
						}

						Object.keys(discordRoles).forEach(async (key) => {
							if (key === "premium" || key === "vip" || key === "scripter") {
								const r = discordRoles[key]
								const role = guild.roles.cache.get(r)

								if (role) {
									if (payload.new[key]) await member.roles.add(role)
									else await member.roles.remove(role)
								}
							}
						})
					}
				)
				.subscribe()
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
		await this.registerModules()
		await this.registerEvents()
		await this.login(process.env.BOT_TOKEN)
	}
}

export const client = new ExtendedClient({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildMessageReactions,
		32767
	],
	partials: [Partials.Message, Partials.Channel, Partials.Reaction]
})
client.start()
