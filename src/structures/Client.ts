import {
  ActivityType,
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
} from "discord.js"
import { CommandType, MenuType } from "../typings/interactions"
import glob from "glob"
import { promisify } from "util"
import { RegisterCommandsOptions } from "../typings/client"
import { Event } from "./Event"
import { wssListen } from "./WebSocket"

const globPromise = promisify(glob)

export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection()
  menus: Collection<string, MenuType> = new Collection()

  constructor() {
    super({ intents: 32767 })
  }

  start() {
    this.registerModules()
    const token =
      process.env.environment === "prod"
        ? process.env.devBotToken
        : process.env.botToken
    this.login(token)
  }

  async importFile(filePath: string) {
    return (await import(filePath))?.default
  }

  async registerCommands({ commands, guildId }: RegisterCommandsOptions) {
    if (guildId) {
      this.guilds.cache.get(guildId)?.commands.set(commands)
      console.log(`Registering commands to ${guildId}`)
      return
    }

    this.application?.commands.set(commands)
    console.log("Registering global commands")
  }

  async registerModules() {
    const path = __dirname.replaceAll("\\", "/") //windows issue maybe? \ needs to be replaced with /

    // Commands
    const slashCommands: ApplicationCommandDataResolvable[] = []
    const commandFiles = await globPromise(
      `${path}/../interactions/commands/**/*{.ts,.js}`
    )

    commandFiles.forEach(async (filePath) => {
      const command: CommandType = await this.importFile(filePath)
      if (!command.name) return
      console.log("Adding command: ", command.name)

      this.commands.set(command.name, command)
      slashCommands.push(command)
    })

    // Menus
    const menuFiles = await globPromise(
      `${path}/../interactions/menus/**/*{.ts,.js}`
    )

    menuFiles.forEach(async (filePath) => {
      const menuCommand: MenuType = await this.importFile(filePath)
      if (!menuCommand.customId) return
      console.log("Adding menu: ", menuCommand.customId)

      this.menus.set(menuCommand.customId, menuCommand)
    })

    this.on("ready", () => {
      this.registerCommands({
        commands: slashCommands,
        guildId: process.env.guildId,
      })

      this.user.setPresence({
        activities: [
          {
            name: "OSRS with Simba",
            type: ActivityType.Playing,
          },
        ],
        status: "online",
      })

      wssListen(this)
    })

    // Event
    const eventFiles = await globPromise(`${path}/../events/*{.ts,.js}`)
    eventFiles.forEach(async (filePath) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath)
      this.on(event.event, event.run)
    })
  }
}
