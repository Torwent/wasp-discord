import { Command } from "$structures/Interactions"
import { supabase } from "$structures/Supabase"

export default new Command({
	name: "wsid",
	description: "Gets the user waspscripts id",
	options: [
		{
			type: 6,
			name: "user",
			description: "Discord user",
			required: true
		}
	],
	run: async ({ interaction }) => {
		let user = ""
		interaction.options.data.forEach((entry) => {
			if (entry.name === "user") {
				user = entry.value as string
				return
			}
		})

		if (user === "") {
			await interaction.editReply("WaspScripts ID: User is not in the discord server.")
			return
		}

		const { data, error } = await supabase
			.schema("profiles")
			.from("profiles")
			.select("id")
			.eq("discord", user)
			.limit(1)

		if (error) {
			console.error(error)
			return
		}
		data
		if (data.length === 0) {
			await interaction.editReply("WaspScripts ID: User not found.")
			return
		}

		await interaction.editReply("WaspScripts ID: " + data[0].id)
	}
})
