import { CommandInteractionOptionResolver } from "discord.js"
import { client } from ".."
import { Event } from "../structures/Event"
import {
  CommandExtendedInteraction,
  MenuExtendedInteraction,
} from "../typings/interactions"

export default new Event("interactionCreate", async (interaction) => {
  // Slash command interactions
  if (interaction.isChatInputCommand()) {
    await interaction.deferReply()
    const command = client.commands.get(interaction.commandName)
    if (!command) return interaction.followUp("That command does not exist!")

    command.run({
      client,
      interaction: interaction as CommandExtendedInteraction,
      args: interaction.options as CommandInteractionOptionResolver,
    })

    return
  }

  //Button interactions
  if (interaction.isButton()) {
    //nothing for now
    return
  }

  //Select menu interactions
  if (interaction.isSelectMenu()) {
    await interaction.deferUpdate()

    const menu = client.menus.get(interaction.customId)
    if (!menu) return interaction.followUp("That command does not exist!")

    menu.run({
      client,
      interaction: interaction as MenuExtendedInteraction,
    })

    return
  }
})
