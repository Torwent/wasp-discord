import { Modal } from "$structures/Interactions"
import { supabase } from "$structures/Supabase"
import { Script } from "$lib/types/collection"
import { modalCompileReply } from "../components/compile"

export default new Modal({
	customId: "help",
	title: "modal",
	components: [],
	run: async ({ interaction }) => {
		if (!interaction.channel.isThread()) return
		const thread = interaction.channel
		const owner = await thread.fetchOwner()

		if (interaction.user.id !== owner.user.id) return

		const scriptId = interaction.fields.getTextInputValue("id")
		const revision = interaction.fields.getTextInputValue("revision")

		const { data, error } = await supabase
			.schema("scripts")
			.from("scripts")
			.select("title, protected (revision)")
			.eq("id", scriptId)
			.limit(1)
			.returns<Script[]>()

		if (error || data.length == 0) {
			return interaction.reply({
				content: "That Script ID doesn't match any on https://waspscripts.com!",
				ephemeral: true
			})
		}

		const script = data[0]

		if (script.protected.revision !== parseInt(revision))
			return await interaction.reply({
				content:
					"You seem to be running an outdated version of the script.\n" +
					"The latest revision of the script is: " +
					script.protected.revision +
					". You are using revision: " +
					revision +
					".\n" +
					"You can download it here: https://waspscripts.com/scripts/" +
					encodeURI(script.title) +
					"&" +
					scriptId +
					"\n\n" +
					"Please update the script and see if the issue still persists, thank you.",
				ephemeral: true
			})

		await interaction.channel.setName(script.title + " - " + interaction.user.username)

		await modalCompileReply(interaction)
	}
})
