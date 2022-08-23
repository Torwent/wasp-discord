import { Command } from "../../structures/Interactions"

export default new Command({
  name: "wiki",
  description: "Replies with a link to osrs wiki resources",
  options: [
    {
      name: "search",
      description: "Replies with a link to osrs wiki resources",
      type: 3,
      required: true,
    },
  ],

  run: async ({ interaction }) => {
    let link: string = "https://oldschool.runescape.wiki/?search="
    if (interaction.options.data.length > 0)
      link += interaction.options.data[0].value

    interaction.followUp(link)
  },
})
