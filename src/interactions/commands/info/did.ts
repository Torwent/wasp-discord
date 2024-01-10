import { Command } from "$structures/Interactions"
import { supabase } from "$structures/Supabase"

const UUID_V4_REGEX =
	/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i

export default new Command({
	name: "did",
	description: "Gets the user discord id",
	options: [
		{
			type: 3,
			name: "wsid",
			description: "User WSID",
			required: true
		}
	],
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })
		const user = interaction.options.data[0].value as string

		if (user === "") {
			await interaction.editReply("WaspScripts ID is empty.")
			return
		}

		if (!UUID_V4_REGEX.test(user)) {
			await interaction.editReply("Invalid WaspScripts ID.")
			return
		}

		const { data, error } = await supabase
			.schema("profiles")
			.from("profiles")
			.select("discord")
			.eq("id", user)
			.limit(1)
			.maybeSingle()

		if (error) {
			console.error(error)
			await interaction.editReply("Discord ID not found.")
			return
		}

		await interaction.editReply("<@" + data.discord + "> " + data.discord)
	}
})
