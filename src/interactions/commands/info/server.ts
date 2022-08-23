import { Command } from "../../../structures/Interactions"

export default new Command({
  name: "server",
  description: "Replies with server info",
  run: async ({ interaction }) => {
    interaction.followUp("Pong")
  },
})
