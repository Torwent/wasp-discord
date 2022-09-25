import { TextChannel, ActionRowBuilder, SelectMenuBuilder } from "discord.js"
import { client } from ".."
import { Event } from "../structures/Event"

export default new Event("ready", async () => {
  console.log("Bot is online")

  let channelId =
    process.env.environment === "prod"
      ? "901909938090156084"
      : "1011326532360343682"

  let channel = await client.channels.fetch(channelId)

  const welcomeChannel = channel as TextChannel
  const messages = await welcomeChannel.messages.fetch()

  if (messages.size === 1) return
  try {
    await welcomeChannel.bulkDelete(messages) //Delete all messages on the channel!
  } catch (error) {
    return console.error(error)
  }

  const row = new ActionRowBuilder().addComponents(
    new SelectMenuBuilder()
      .setCustomId("welcome")
      .setPlaceholder("Choose an option")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions([
        {
          label: "OSRS Botter",
          value: "botter",
          description: "You are only interested in botting.",
          emoji: "🤖",
        },
        {
          label: "Developer",
          value: "developer",
          description: "You are interested in botting/learning/teaching code.",
          emoji: "💻",
        },
      ])
  )

  welcomeChannel.send({
    content:
      "**Welcome to WaspScripts Discord Server!**\n\nPlease choose what you are interested in:",
    components: [row as any],
  })
})
