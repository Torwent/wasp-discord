import {
  ChatInputApplicationCommandData,
  CommandInteraction,
  CommandInteractionOptionResolver,
  GuildMember,
  PermissionResolvable,
  SelectMenuComponentData,
  SelectMenuComponentOptionData,
  SelectMenuInteraction,
} from "discord.js"
import { ExtendedClient } from "../structures/Client"

/** Slash command
 * {
 *   name: "commandname",
 *   description: "any description",
 *   run: async({ interaction }) => {}
 * }
 */
export interface CommandExtendedInteraction extends CommandInteraction {
  member: GuildMember
}

/** Menu command
 * {
 *   customId: "commandname",
 *   type: 3,
 *   run: async({ interaction }) => {}
 * }
 */
export interface MenuExtendedInteraction extends SelectMenuInteraction {
  member: GuildMember
}

interface CommandRunOptions {
  client: ExtendedClient
  interaction: CommandExtendedInteraction
  args: CommandInteractionOptionResolver
}

interface MenuRunOptions {
  client: ExtendedClient
  interaction: MenuExtendedInteraction
}

type CommandRunFunction = (options: CommandRunOptions) => any
type MenuRunFunction = (options: MenuRunOptions) => any

export type CommandType = {
  userPermissions?: PermissionResolvable[]
  run: CommandRunFunction
} & ChatInputApplicationCommandData

export type MenuType = {
  userPermissions?: PermissionResolvable[]
  run: MenuRunFunction
} & SelectMenuComponentData
