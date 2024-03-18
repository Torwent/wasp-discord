import type { Command } from "$lib/interaction"
import { EmbedBuilder, PermissionFlagsBits } from "discord.js"

const command: Command = {
	name: "server",
	defaultMemberPermissions: [PermissionFlagsBits.ModerateMembers],
	description: "Replies with server info",
	run: async ({ interaction }) => {
		await interaction.deferReply()

		const guild = interaction.guild
		if (!guild) {
			interaction.followUp("This can only be used in a guild")
			return
		}

		const totalUsers = interaction.guild.memberCount
		const rolesCache = interaction.guild.roles.cache
		const admins = rolesCache.get("816271648118013953")?.members.size ?? 0
		const mods = rolesCache.get("1018906735123124315")?.members.size ?? 0
		const scripters = rolesCache.get("1069140447647240254")?.members.size ?? 0
		const testers = rolesCache.get("907209408860291113")?.members.size ?? 0
		const boosters = rolesCache.get("973348648928808991")?.members.size ?? 0
		const vips = rolesCache.get("1193104319122260018")?.members.size ?? 0
		const premiums = rolesCache.get("1193104090264252448")?.members.size ?? 0

		const otherCount = totalUsers - admins - mods - scripters - testers - boosters - vips - premiums

		const embed = new EmbedBuilder()
			.setColor(0xffa200)
			.setTitle("WaspScripts")
			.setURL("https://waspscripts.com")
			.setDescription("Information about WaspScripts Discord server")
			.setThumbnail(
				"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/multi-color-logo.png?t=2022-08-23T11%3A25%3A19.324Z"
			)
			.addFields(
				{ name: "Total users", value: `${totalUsers}` },
				{ name: "Administrators", value: `${admins}`, inline: true },
				{ name: "Moderators", value: `${mods}`, inline: true },
				{ name: "Scripters", value: `${scripters}`, inline: true },
				{ name: "Testers", value: `${testers}`, inline: true },
				{ name: "Boosters", value: `${boosters}`, inline: true },
				{ name: "VIP", value: `${vips}`, inline: true },
				{ name: "Premium", value: `${premiums}`, inline: true },
				{ name: "Other", value: `${otherCount}`, inline: true }
			)

		interaction.followUp({ embeds: [embed] })
	}
}

export default command
