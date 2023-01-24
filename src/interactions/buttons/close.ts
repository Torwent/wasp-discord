import { Button } from "../../structures/Interactions"
import { ButtonStyle } from "discord.js"

export default new Button({
  customId: "close",
  label: "Close",
  style: ButtonStyle.Secondary,
  type: 2,
  run: async ({ interaction }) => {
    if (!interaction.channel.isThread()) return
    const thread = interaction.channel
    if (thread.locked || thread.archived) return
    await interaction.deferReply({ ephemeral: true })

    const owner = await thread.fetchOwner()

    if (
      interaction.user.id !== owner.user.id ||
      interaction.member.roles.cache.has("1067385733796593684")
    )
      return await interaction.editReply(
        "Only the OP and <@1067385733796593684> can close the issue!"
      )

    await interaction.editReply(
      "Your post has been closed. You can reopen it at anytime by simply sending any message!"
    )

    return await thread.setArchived(true, "Post closed.")
  },
})
