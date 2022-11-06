import { supabase } from "./../../structures/Supabase"
import { Command } from "../../structures/Interactions"
import { ApplicationCommandOptionChoiceData } from "discord.js"

const getScriptChoicesAsync = async (): Promise<
  ApplicationCommandOptionChoiceData[]
> => {
  const { data, error } = await supabase.from("scripts_public").select()

  if (error) {
    console.error(error)
    return []
  }

  let choices: ApplicationCommandOptionChoiceData[] = []
  let choice: ApplicationCommandOptionChoiceData

  for (let i = 0; i < data.length; i++) {
    if (i > 24) break
    choice = {
      name: data[i].title,
      value: "/scripts/" + data[i].title + "&" + data[i].id,
    }
    choices.push(choice)
  }

  return choices
}

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
      {
        type: 3,
        name: "script",
        description: "Link to a script (only 25 can be displayed)",
        choices: await getScriptChoicesAsync(),
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
          if (entry.name === "script") link += entry.value as string
        })
      }

      interaction.followUp(link)
    },
  })
}

export default cmd()
