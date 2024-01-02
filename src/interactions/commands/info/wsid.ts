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
		await interaction.deferReply({ ephemeral: true })
		const user = interaction.options.data[0].value as string

		if (user === "") {
			await interaction.editReply("WaspScripts ID not found.")
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
			await interaction.editReply("WaspScripts ID not found.")
			return
		}

		await interaction.editReply(data[0].id)
	}
})
