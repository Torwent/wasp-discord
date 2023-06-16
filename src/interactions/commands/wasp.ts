import { Command } from "../../structures/Interactions"

async function cmd() {
  return new Command({
    name: "wasp",
    description: 'Replies with resources from https://waspscripts.com"',
    options: [
      {
        type: 3,
        name: "page",
        description: "Page",
        choices: [
          {
            name: "Setup",
            value: "/setup",
          },
          {
            name: "Manual setup",
            value: "/tutorials/setup-windows-by-torwent",
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
            name: "Tutorials",
            value: "/tutorials",
          },
        ],
      },
      {
        type: 3,
        name: "script",
        description: "Search a script",
        required: true,
      },
      {
        type: 3,
        name: "tutorials",
        description: "Search a tutorial",
        required: true,
      },
      {
        type: 3,
        name: "stats",
        description: "Search a stats user",
        required: true,
      },
      {
        type: 3,
        name: "devs",
        description: "Search a developer",
        required: true,
      },
      {
        type: 6,
        name: "user",
        description: "user to ping",
        required: false,
      },
    ],

    run: async ({ interaction }) => {
      let link: string = "https://waspscripts.com"
      if (interaction.options.data.length > 0) {
        interaction.options.data.forEach((entry) => {
          if (entry.name === "user")
            link = "<@" + entry.value + "> Check: " + link
          if (entry.name === "page") link += encodeURI(entry.value as string)
          if (entry.name === "script")
            link += "/scripts?search=" + encodeURI(entry.value as string)
          if (entry.name === "tutorials")
            link += "/tutorials?search=" + encodeURI(entry.value as string)
          if (entry.name === "stats")
            link += "/stats?search=" + encodeURI(entry.value as string)
          if (entry.name === "devs")
            link += "/devs?search=" + encodeURI(entry.value as string)
        })
      }

      interaction.followUp(link)
    },
  })
}

export default cmd()
