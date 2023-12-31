import { Command } from "$structures/Interactions"
import { EmbedBuilder } from "discord.js"

export default new Command({
	name: "server",
	description: "Replies with server info",
	run: async ({ interaction }) => {
		await interaction.deferReply()
		const rolesCache = interaction.guild.roles.cache
		const scripterCount = rolesCache.get("1069140447647240254").members.size
		const testCounter = rolesCache.get("907209408860291113").members.size
		const boostCount = rolesCache.get("907209408860291113").members.size

		const embed = new EmbedBuilder()
			.setColor(0xffa200)
			.setTitle("WaspScripts")
			.setURL("https://waspscripts.com")
			.setDescription("Information about WaspScripts Discord server")
			.setThumbnail(
				"https://enqlpchobniylwpsjcqc.supabase.co/storage/v1/object/public/imgs/logos/multi-color-logo.png?t=2022-08-23T11%3A25%3A19.324Z"
			)
			.addFields(
				{ name: "Total users", value: `${interaction.guild.memberCount}` },
				{ name: "Scripters", value: `${scripterCount}`, inline: true },
				{ name: "Testers", value: `${testCounter}`, inline: true },
				{ name: "Boosters", value: `${boostCount}`, inline: true }
			)

		interaction.followUp({ embeds: [embed] })
	}
})
