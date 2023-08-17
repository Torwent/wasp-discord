import { Command } from "../../../structures/Interactions"
import { EmbedBuilder } from "discord.js"

export default new Command({
	name: "server",
	description: "Replies with server info",
	run: async ({ interaction }) => {
		const rolesCache = interaction.guild.roles.cache
		const vipCount = rolesCache.get("931167526681972746").members.size,
			premCount = rolesCache.get("820985772140134440").members.size,
			testCounter = rolesCache.get("907209408860291113").members.size,
			devCount = rolesCache.get("864744526894333963").members.size,
			regCount = rolesCache.get("901892382616846366").members.size,
			boostCount = rolesCache.get("973348648928808991").members.size

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
				{ name: "VIP users", value: `${vipCount}`, inline: true },
				{ name: "Premium users", value: `${premCount}`, inline: true },
				{ name: "Testers", value: `${testCounter}`, inline: true },
				{ name: "Developers", value: `${devCount}`, inline: true },
				{ name: "Regular users", value: `${regCount}`, inline: true },
				{ name: "Boosters", value: `${boostCount}`, inline: true }
			)

		interaction.followUp({ embeds: [embed] })
	}
})
