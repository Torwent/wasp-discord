import { forumListen, forumUnarchiveListen } from "./Forum"
import {
  ActivityType,
  ApplicationCommandDataResolvable,
  Client,
  ClientEvents,
  Collection,
} from "discord.js"
import {
  ButtonType,
  CommandType,
  MenuType,
  ModalType,
} from "../typings/interactions"
import glob from "glob"
import { promisify } from "util"
import { RegisterCommandsOptions } from "../typings/client"
import { Event } from "./Event"
import { wssListen } from "./WebSocket"

const globPromise = promisify(glob)

export class ExtendedClient extends Client {
  commands: Collection<string, CommandType> = new Collection()
  buttons: Collection<string, ButtonType> = new Collection()
  menus: Collection<string, MenuType> = new Collection()
  modals: Collection<string, ModalType> = new Collection()

  constructor() {
    super({ intents: 32767 })
  }

  async start() {
    await this.registerModules()
    await this.login(process.env.botToken)
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

  // Register modules (Commands, Buttons, Menus, Modals, ...)
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

    // Buttons
    const buttonFiles = await globPromise(
      `${path}/../interactions/buttons/**/*{.ts,.js}`
    )

    buttonFiles.forEach(async (filePath) => {
      const buttonCommand: ButtonType = await this.importFile(filePath)
      if (!buttonCommand.customId) return
      console.log("Adding button: ", buttonCommand.customId)

      this.buttons.set(buttonCommand.customId, buttonCommand)
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

    //Modals
    const modalFiles = await globPromise(
      `${path}/../interactions/modals/**/*{.ts,.js}`
    )

    modalFiles.forEach(async (filePath) => {
      const modalCommand: ModalType = await this.importFile(filePath)
      if (!modalCommand.customId) return
      console.log("Adding modal: ", modalCommand.customId)

      this.modals.set(modalCommand.customId, modalCommand)
    })

    this.on("ready", async () => {
      await this.registerCommands({
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

      await wssListen(this)
      await forumListen(this)
      await forumUnarchiveListen(this)
    })

    // Event
    const eventFiles = await globPromise(`${path}/../events/*{.ts,.js}`)
    eventFiles.forEach(async (filePath) => {
      const event: Event<keyof ClientEvents> = await this.importFile(filePath)
      this.on(event.event, event.run)
    })
  }
}
