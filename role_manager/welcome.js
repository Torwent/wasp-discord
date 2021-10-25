const { MessageActionRow, MessageSelectMenu } = require("discord.js")

const config = require("../config.json").discord

const channelID = config.channels.welcome

module.exports = async (client) => {
  if (!config.realBot) return

  const channel = await client.channels.fetch(channelID)

  const row = new MessageActionRow().addComponents(
    new MessageSelectMenu()
      .setCustomId("welcome")
      .setPlaceholder("Choose an option")
      .setMinValues(1)
      .setMaxValues(1)
      .addOptions([
        {
          label: "OSRS Botter",
          value: "osrsbotter",
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

  channel.messages.fetch().then((messages) => {
    if (messages.size != 0) {
      channel.messages.fetch().then((results) => {
        channel.bulkDelete(results)
      })
    }

    channel.send({
      content:
        "**Welcome to WaspBot server!**\n\nPlease choose what you are interested in:",
      components: [row],
    })
  })
}
