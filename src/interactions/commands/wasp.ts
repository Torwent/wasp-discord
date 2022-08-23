import { Command } from "../../structures/Interactions"

export default new Command({
  name: "wasp",
  description: 'Replies with resources from https://waspscripts.com"',
  options: [
    {
      type: 3,
      name: "page",
      description:
        "Replies with a link to one of the main sections of https://waspscripts.com",
      required: false,
      choices: [
        {
          name: "Setup",
          value: "/setup",
        },
        {
          name: "Manual setup",
          value: "/blog/Setup%20(Windows)",
        },
        {
          name: "Scripts",
          value: "/scripts",
        },
        {
          name: "Premium",
          value: "/premium",
        },
        {
          name: "Faq",
          value: "/faq",
        },
        {
          name: "Blog",
          value: "/blog",
        },
      ],
    },
  ],

  run: async ({ interaction }) => {
    let link: string = "https://waspscripts.com"
    if (interaction.options.data.length > 0)
      link += interaction.options.data[0].value

    interaction.followUp(link)
  },
})
