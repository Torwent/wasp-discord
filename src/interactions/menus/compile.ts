import { Menu } from "../../structures/Interactions"
import { threadReply } from "../components/close_thread"

const compileError = ""
const bug = ""

export default new Menu({
  customId: "compile",
  type: 3,
  run: async ({ interaction }) => {
    if (interaction.values.length === 0) return

    if (!interaction.channel.isThread()) return
    const thread = interaction.channel
    const owner = await thread.fetchOwner()

    console.log(thread.appliedTags)

    if (interaction.user.id !== owner.user.id) return

    if (interaction.values.includes("no")) {
      thread.setName("Simba/Compiling issue - " + interaction.user.username)
    }

    await threadReply(interaction)
  },
})
