import type { Command } from "$lib/interaction"
import { ApplicationCommandType } from "discord.js"

const recentUsers = new Set()
const minutes = 5

const command: Command = {
	name: "Quick Help",
	type: ApplicationCommandType.Message,
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
		const caller = interaction.member
		const role = caller.roles.cache.find(
			(r) =>
				r.name === "Tester" ||
				r.name === "Scripter" ||
				r.name === "Moderator" ||
				r.name === "Administrator"
		)

		if (role == null) {
			await interaction.editReply("You are not allowed to use this command.")
			return
		}

		if (recentUsers.has(caller.id)) {
			await interaction.editReply(
				"You can't use this command more than once every + " + minutes + " minute."
			)
			return
		}

		const message = interaction.options.data[0]
		const user = message.message.author.id

		if (user === "") {
			await interaction.editReply("Discord ID is empty.")
			return
		}

		message.message.reply(`
Hello <@${user}>!
Looks like the problem you've posted about is commonly solved by:
- Making sure you are fully up-to-date on SRL-T, WaspLib, and the script itself.
 - See: https://discord.com/channels/795071177475227709/1249458850587869236
- Making sure you are on Fixed - Classic Layout.
 - I've never had an issue on Fixed - Classic display mode and even use it when the author says resizable classic (🤢) works.
 - See: https://discord.com/channels/795071177475227709/1266728566024962100/1266728855398252604
- Making sure your client settings are correct (Brightness/XP Bar/etc.):
 - Use the Settings Searcher script to make sure all of your settings are right.
 - See: https://discord.com/channels/795071177475227709/1150590225555402802/1251695172450779137
- Making sure you are using the Wasp RuneLite profile.
 - RuneLite support is not carte blanche to use whatever plugins you want. Use only what is installed for you in the profile.
 - See: https://discord.com/channels/795071177475227709/1266728566024962100/1266728833302663260
## Still having problems? Please provide a screenshot!
Screenshots of your **WHOLE MONITOR (Simba + RL)** with sensitive information blocked out is more valuable and provides more information than pasting only a small portion of the Simba error.
## These answers and the answers to EVEN MORE questions can be found in our FAQ: https://discord.com/channels/795071177475227709/1249455251761664041
`)
		await interaction.editReply("The user has been messaged.")

		recentUsers.add(caller.id)
		setTimeout(() => {
			recentUsers.delete(caller.id)
		}, 600000 * minutes)
	}
}

export default command
