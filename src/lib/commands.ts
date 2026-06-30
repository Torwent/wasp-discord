import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	CacheType,
	Collection,
	CommandInteractionOptionResolver,
	GuildMember,
	MessageActionRowComponentBuilder,
	MessageFlags
} from "discord.js"
import { CommandExtendedInteraction } from "./interaction"
import { getRole } from "./lib"
import { getWSID, supabase } from "./supabase"

type ProductCacheEntry = {
	name: string
	cachedAt: number
}

const CACHE_TTL = 60 * 60 * 1000
const productsMap: Map<string, ProductCacheEntry> = new Collection()

function getProductName(id: string) {
	const entry = productsMap.get(id)
	if (!entry) return null

	if (Date.now() - entry.cachedAt > CACHE_TTL) {
		productsMap.delete(id)
		return null
	}

	return entry.name
}

function setProductName(id: string, name: string) {
	productsMap.set(id, {
		name,
		cachedAt: Date.now()
	})
}

const amount = 10

async function getAllSubscriptions(wsid: string, page: number) {
	const [old, current] = await Promise.all([
		supabase
			.schema("profiles")
			.from("subscriptions_old")
			.select("id, product, date_start, date_end, cancel", { count: "exact" })
			.eq("id", wsid)
			.order("date_end", { ascending: false }),
		supabase
			.schema("profiles")
			.from("subscription")
			.select("id, product, date_start, date_end, cancel", { count: "exact" })
			.eq("id", wsid)
			.order("date_end", { ascending: false })
	])

	if (old.error) return { count: old.count, data: old.data, error: old.error }
	if (current.error) return { count: current.count, data: current.data, error: current.error }

	const data = [...old.data, ...current.data].sort(
		(a, b) => new Date(b.date_end).getTime() - new Date(a.date_end).getTime()
	)

	const start = page * amount
	const end = start + amount
	const sliced = data.slice(start, end)
	const count = (old.count ?? 0) + (current.count ?? 0)

	return {
		count,
		data: sliced,
		error: null
	}
}

export async function getSubscriptions(member: GuildMember, wsid: string, page: number) {
	let message = "# Subscriptions\n"

	const { count, data, error } = await getAllSubscriptions(wsid, page)

	if (error) {
		return {
			content: "Database error:\n```json\n" + JSON.stringify(error) + "\n```",
			flags: MessageFlags.Ephemeral
		}
	}

	const products = []
	const missing = new Map<string, typeof data>()

	for (const entry of data) {
		const name = getProductName(entry.product)

		if (name) {
			products.push({ ...entry, name })
			continue
		}

		if (!missing.has(entry.product)) missing.set(entry.product, [])
		missing.get(entry.product)!.push(entry)
	}

	if (missing.size > 0) {
		const { data, error } = await supabase
			.schema("scripts")
			.from("products")
			.select("id, name")
			.in("id", [...missing.keys()])

		if (error) {
			return {
				content: "Database error:\n```json\n" + JSON.stringify(error) + "\n```",
				flags: MessageFlags.Ephemeral
			}
		}

		for (const row of data) {
			setProductName(row.id, row.name)
		}

		for (const [productId, entries] of missing.entries()) {
			const name = getProductName(productId)
			if (!name)
				return {
					content: "Failed to get product name for: " + productId,
					flags: MessageFlags.Ephemeral
				}

			for (const entry of entries) {
				products.push({ ...entry, name })
			}
		}
	}

	message += `## WSID: ${wsid}\n`
	message += `### Total: ${count ?? 0}\n`
	message += `### Page: ${page + 1}\n\n`

	message += "```\n"

	const now = new Date()
	for (const entry of products) {
		const dateEnd = new Date(entry.date_end)
		message += entry.product + " " + entry.id
		message += " From " + new Date(entry.date_start).toLocaleDateString("PT-pt")
		message += " To " + dateEnd.toLocaleDateString("PT-pt")
		if (now > dateEnd) {
			message += " TERMINATED "
		} else {
			if (entry.cancel !== undefined) message += " Cancel " + entry.cancel
		}
		message += " > " + entry.name
		message += "\n"
	}
	message += "```\n"

	if (getRole(member, ["administrator"])) {
		for (const entry of products) {
			message += `> ${(entry.name + ":").padEnd(
				16,
				" "
			)} <https://dashboard.stripe.com/acct_1RerVIG22w4J2Ay5/subscriptions/${entry.id}>\n`
		}
	}

	const previous = new ButtonBuilder()
		.setCustomId("subscriptions_previous")
		.setLabel("Previous")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(page < 1)

	const nextDisabled = (page + 1) * amount >= count
	const next = new ButtonBuilder()
		.setCustomId("subscriptions_next")
		.setLabel("Next")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(nextDisabled)

	const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(previous, next)

	return { content: message, components: [row], flags: MessageFlags.Ephemeral }
}

async function getAllFreeAccess(wsid: string, page: number) {
	const [old, current] = await Promise.all([
		supabase
			.schema("profiles")
			.from("free_access_old")
			.select("id, product, date_start, date_end", { count: "exact" })
			.eq("id", wsid)
			.order("date_end", { ascending: false }),
		supabase
			.schema("profiles")
			.from("free_access")
			.select("id, product, date_start, date_end", { count: "exact" })
			.eq("id", wsid)
			.order("date_end", { ascending: false })
	])

	if (old.error) {
		return { count: old.count, data: old.data, error: old.error }
	}
	if (current.error) {
		return { count: current.count, data: current.data, error: current.error }
	}
	const data = [...old.data, ...current.data].sort(
		(a, b) => new Date(b.date_end).getTime() - new Date(a.date_end).getTime()
	)

	const start = page * amount
	const end = start + amount
	const sliced = data.slice(start, end)

	return {
		count: (old.count ?? 0) + (current.count ?? 0),
		data: sliced,
		error: null
	}
}

export async function getFreeAccess(wsid: string, page: number) {
	let message = "# Free Access\n"

	const { count, data, error } = await getAllFreeAccess(wsid, page)

	if (error) {
		return {
			content: "Database error:\n```json\n" + JSON.stringify(error) + "\n```",
			flags: MessageFlags.Ephemeral
		}
	}

	const products = []
	const missing = new Map<string, typeof data>()

	for (const entry of data) {
		const name = getProductName(entry.product)

		if (name) {
			products.push({ ...entry, name })
			continue
		}

		if (!missing.has(entry.product)) missing.set(entry.product, [])
		missing.get(entry.product)!.push(entry)
	}

	if (missing.size > 0) {
		const { data, error } = await supabase
			.schema("scripts")
			.from("products")
			.select("id, name")
			.in("id", [...missing.keys()])

		if (error) {
			return {
				content: "Database error:\n```json\n" + JSON.stringify(error) + "\n```",
				flags: MessageFlags.Ephemeral
			}
		}

		for (const row of data) {
			setProductName(row.id, row.name)
		}

		for (const [productId, entries] of missing.entries()) {
			const name = getProductName(productId)
			if (!name)
				return {
					content: "Failed to get product name for: " + productId,
					flags: MessageFlags.Ephemeral
				}

			for (const entry of entries) {
				products.push({ ...entry, name })
			}
		}
	}

	message += `## WSID: ${wsid}\n`
	message += `### Total: ${count ?? 0}\n`
	message += `### Page: ${page + 1}\n\n`

	message += "```\n"

	const now = new Date()
	for (const entry of products) {
		const dateEnd = new Date(entry.date_end)
		message += entry.product + " " + entry.id
		message += " From " + new Date(entry.date_start).toLocaleDateString("PT-pt")
		message += " To " + dateEnd.toLocaleDateString("PT-pt")
		if (now > dateEnd) {
			message += " TERMINATED "
		}
		message += " > " + entry.name
		message += "\n"
	}
	message += "```\n"

	const previous = new ButtonBuilder()
		.setCustomId("access_previous")
		.setLabel("Previous")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(page < 1)

	const nextDisabled = (page + 1) * amount >= count
	const next = new ButtonBuilder()
		.setCustomId("access_next")
		.setLabel("Next")
		.setStyle(ButtonStyle.Secondary)
		.setDisabled(nextDisabled)

	const row = new ActionRowBuilder<MessageActionRowComponentBuilder>().addComponents(previous, next)

	return { content: message, components: [row], flags: MessageFlags.Ephemeral }
}

export async function wsid(
	interaction: CommandExtendedInteraction,
	args: CommandInteractionOptionResolver<CacheType>
) {
	await interaction.deferReply({ ephemeral: true })
	const user = args.data[0].value as string

	if (user === "") {
		await interaction.editReply("Discord ID is empty.").catch((e) => console.error(e))
		return
	}

	const id = await getWSID(user)

	await interaction.editReply(id).catch((e) => console.error(e))
}
