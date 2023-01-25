import { Menu } from "../../structures/Interactions"
import { threadReply } from "../components/close_thread"

export default new Menu({
  customId: "compile_simba",
  type: 3,
  run: async ({ interaction }) => {
    if (interaction.values.length === 0) return

    if (!interaction.channel.isThread()) return

    const thread = interaction.channel
    const owner = await thread.fetchOwner()

    if (interaction.user.id !== owner.user.id) return
    if (interaction.values.includes("yes")) {
      await thread.setName("Coding help - " + interaction.user.username)
      thread.setAppliedTags(["1020028124693549138"])
    }

    if (interaction.values.includes("no")) {
      thread.setName("Simba/Compiling issue - " + interaction.user.username)
      thread.setAppliedTags(["1019687260469346446"])
    }

    await threadReply(interaction)
  },
})
