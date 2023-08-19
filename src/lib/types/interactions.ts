import {
	ChatInputApplicationCommandData,
	CommandInteraction,
	CommandInteractionOptionResolver,
	GuildMember,
	PermissionResolvable,
	BaseSelectMenuComponentData,
	StringSelectMenuInteraction,
	ModalSubmitInteraction,
	ModalComponentData,
	ButtonInteraction,
	InteractionButtonComponentData
} from "discord.js"
import { ExtendedClient } from "$structures/Client"

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

interface CommandRunOptions {
	client: ExtendedClient
	interaction: CommandExtendedInteraction
	args: CommandInteractionOptionResolver
}

type CommandRunFunction = (options: CommandRunOptions) => any

export type CommandType = {
	run: CommandRunFunction
} & ChatInputApplicationCommandData

/** Button command
 * {
 *   customId: "commandname",
 *   type: 3,
 *   run: async({ interaction }) => {}
 * }
 */
export interface ButtonExtendedInteraction extends ButtonInteraction {
	member: GuildMember
}

interface ButtonRunOptions {
	client: ExtendedClient
	interaction: ButtonExtendedInteraction
}

type ButtonRunFunction = (options: ButtonRunOptions) => any

export type ButtonType = {
	defaultMemberPermissions?: PermissionResolvable[]
	run: ButtonRunFunction
} & InteractionButtonComponentData

/** Menu command
 * {
 *   customId: "commandname",
 *   type: 3,
 *   run: async({ interaction }) => {}
 * }
 */
export interface MenuExtendedInteraction extends StringSelectMenuInteraction {
	member: GuildMember
}

interface MenuRunOptions {
	client: ExtendedClient
	interaction: MenuExtendedInteraction
}

type MenuRunFunction = (options: MenuRunOptions) => any

export type MenuType = {
	defaultMemberPermissions?: PermissionResolvable[]
	run: MenuRunFunction
} & BaseSelectMenuComponentData

/** Modal command
 * {
 *   customId: "commandname",
 *   type: 3,
 *   run: async({ interaction }) => {}
 * }
 */
export interface ModalExtendedInteraction extends ModalSubmitInteraction {
	member: GuildMember
}

interface ModalRunOptions {
	client: ExtendedClient
	interaction: ModalExtendedInteraction
}

type ModalRunFunction = (options: ModalRunOptions) => any

export type ModalType = {
	defaultMemberPermissions?: PermissionResolvable[]
	run: ModalRunFunction
} & ModalComponentData
