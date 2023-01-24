import { ActionRowBuilder, StringSelectMenuBuilder } from "discord.js"
import { Modal } from "../../structures/Interactions"
import { supabase } from "../../structures/Supabase"
import { compileReply } from "../components/compile"

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

    const { data: publicData, error: publicError } = await supabase
      .from("scripts_public")
      .select("title")
      .eq("id", scriptId)

    console.log(publicData)

    if (publicError || publicData == null) {
      return interaction.reply({
        content: "That Script ID doesn't match any on https://waspscripts.com!",
        ephemeral: true,
      })
    }

    const { data: protectedData, error: protectedError } = await supabase
      .from("scripts_protected")
      .select("revision")
      .eq("id", scriptId)

    if (protectedError)
      return interaction.reply({
        content:
          "There was some kind of unextected error. <@1067359962247987210> for help.",
        ephemeral: true,
      })

    if (parseInt(protectedData[0].revision) !== parseInt(revision))
      return interaction.reply({
        content:
          "You seem to be running an outdated version of the script.\n" +
          "The latest revision of the script is: " +
          protectedData[0].revision +
          ". You are using revision: " +
          revision +
          ".\n" +
          "You can download it here: https://waspscripts.com/scripts/" +
          encodeURI(publicData[0].title) +
          "&" +
          scriptId +
          "\n\n" +
          "Please update the script and see if the issue still persists, thank you.",
        ephemeral: true,
      })

    interaction.channel.setName(
      publicData[0].title + " - " + interaction.user.username
    )

    await compileReply(interaction)
  },
})
