import { Command } from "$structures/Interactions"
import { EmbedBuilder, PermissionFlagsBits } from "discord.js"

export default new Command({
	name: "server",
	defaultMemberPermissions: [PermissionFlagsBits.ModerateMembers],
	description: "Replies with server info",
	run: async ({ interaction }) => {
		await interaction.deferReply()
		const totalUsers = interaction.guild.memberCount
		const rolesCache = interaction.guild.roles.cache
		const adminCount = rolesCache.get("816271648118013953").members.size
		const modCount = rolesCache.get("1018906735123124315").members.size
		const scripterCount = rolesCache.get("1069140447647240254").members.size
		const testerCount = rolesCache.get("907209408860291113").members.size
		const boosterCount = rolesCache.get("973348648928808991").members.size
		const vipCount = rolesCache.get("1193104319122260018").members.size
		const premiumCount = rolesCache.get("1193104090264252448").members.size
		const otherCount =
			totalUsers -
			adminCount -
			modCount -
			scripterCount -
			testerCount -
			boosterCount -
			vipCount -
			premiumCount

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
				{ name: "Administrators", value: `${adminCount}`, inline: true },
				{ name: "Moderators", value: `${modCount}`, inline: true },
				{ name: "Scripters", value: `${scripterCount}`, inline: true },
				{ name: "Testers", value: `${testerCount}`, inline: true },
				{ name: "Boosters", value: `${boosterCount}`, inline: true },
				{ name: "VIP", value: `${vipCount}`, inline: true },
				{ name: "Premium", value: `${premiumCount}`, inline: true },
				{ name: "Other", value: `${otherCount}`, inline: true }
			)

		interaction.followUp({ embeds: [embed] })
	}
})
