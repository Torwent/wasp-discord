import { Command } from "$structures/Interactions"
import { supabase } from "$structures/Supabase"

const UUID_V4_REGEX =
	/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[4][0-9a-fA-F]{3}-[89AB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i

interface UserData {
	id: string
	roles: {
		tester: boolean
		scripter: boolean
		moderator: boolean
		administrator: boolean
	}
}

export default new Command({
	name: "access",
	description: "Gets the user waspscripts id",
	options: [
		{
			type: 6,
			name: "user",
			description: "Discord user",
			required: true
		},
		{
			type: 3,
			name: "script",
			description: "Search a script or use it's ID",
			required: true
		}
	],
	run: async ({ interaction }) => {
		await interaction.deferReply({ ephemeral: true })

		const role = interaction.member.roles.cache.find(
			(r) => r.name === "Scripter" || r.name === "Moderator"
		)

		if (role == null) {
			await interaction.editReply("You are not allowed to use this command.")
			return
		}

		const user = interaction.options.data[0].value as string

		if (user === "") {
			await interaction.editReply("WaspScripts ID not found.")
			return
		}

		const { data: userData, error: userError } = await supabase
			.schema("profiles")
			.from("profiles")
			.select("id, roles!roles_id_fkey (tester, scripter, moderator, administrator)")
			.eq("discord", user)
			.limit(1)
			.limit(1, { foreignTable: "roles" })
			.single<UserData>()

		if (userError) {
			await interaction.editReply("WaspScripts ID not found. This user never logged in on website.")
			return
		}

		const { id: user_id, roles } = userData

		if (roles.administrator || roles.moderator || roles.scripter || roles.tester) {
			await interaction.editReply("true")
			return
		}

		const script = interaction.options.data[1].value as string
		const isUUID = UUID_V4_REGEX.test(script)

		if (isUUID) {
			const { data } = await supabase
				.schema("profiles")
				.rpc("can_access", { accesser_id: user_id, script_id: script })
				.returns<boolean>()

			const result = data ?? false
			await interaction.editReply(result.toString())
			return
		}

		const { data: scriptsData, error: scriptError } = await supabase
			.schema("scripts")
			.from("scripts")
			.select("id, title, categories")
			.eq("published", true)
			.ilike("search", "%" + script.trim().replaceAll(" ", "%") + "%")

		if (scriptError || scriptsData.length === 0) {
			await interaction.editReply("Script was not found.")
			return
		}

		if (scriptsData.length > 1) {
			await interaction.editReply(
				"Multiple scripts found for this search:" + scriptsData.map((s) => " " + s.title).toString()
			)
			return
		}

		const { id: script_id, categories } = scriptsData[0]

		if (categories.includes("Free")) {
			await interaction.editReply("true")
			return
		}

		const { data } = await supabase
			.schema("profiles")
			.rpc("can_access", { accesser_id: user_id, script_id: script_id })
			.returns<boolean>()

		const result = data ?? false
		await interaction.editReply(result.toString())
	}
})
