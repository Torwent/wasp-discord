const { MessageActionRow, MessageButton } = require("discord.js")

const config = require("../config.json").discord

const channelID = config.channels.management

const downloadMessage = `**Welcome to the download section!**

Choose the script you would like to download:`

module.exports = async (client) => {
  //if (!config.realBot) return

  const channel = await client.channels.fetch(channelID)

  const scripts = {
    "Script Chainer": "🔗",
    "AIO Agility": "🏃",
    "AIO Combiner": "🖇",
    "AIO Fletcher": "🏹",
    "AIO Herblore": "🧪",
    "AIO Rod Fisher": "🎣",
    "AIO Smither": "🔨",
    "Astral Runecrafter": "✨",
    "Pest Controller": "🧘",
    Wintertodt: "🔥",
  }

  const scriptArray = []
  const emojis = []
  const rows = []
  const row0 = new MessageActionRow()
  const row1 = new MessageActionRow()
  const row2 = new MessageActionRow()
  const row3 = new MessageActionRow()
  const row4 = new MessageActionRow()

  for (let key in scripts) {
    scriptArray.push(key)
    emojis.push(scripts[key])
  }

  for (let i = 0; i < scriptArray.length; i++) {
    if (i < 5) {
      if (!rows.includes(row0)) rows.push(row0)
      row0.addComponents(
        new MessageButton()
          .setCustomId(`download${i}`)
          .setLabel(scriptArray[i])
          .setStyle("SECONDARY")
          .setEmoji(emojis[i])
      )
    } else if (i < 10) {
      if (!rows.includes(row1)) rows.push(row1)
      row1.addComponents(
        new MessageButton()
          .setCustomId(`download${i}`)
          .setLabel(scriptArray[i])
          .setStyle("SECONDARY")
          .setEmoji(emojis[i])
      )
    } else if (i < 15) {
      if (!rows.includes(row2)) rows.push(row2)
      row2.addComponents(
        new MessageButton()
          .setCustomId(`download${i}`)
          .setLabel(scriptArray[i])
          .setStyle("SECONDARY")
          .setEmoji(emojis[i])
      )
    } else if (i < 20) {
      if (!rows.includes(row3)) rows.push(row3)
      row3.addComponents(
        new MessageButton()
          .setCustomId(`download${i}`)
          .setLabel(scriptArray[i])
          .setStyle("SECONDARY")
          .setEmoji(emojis[i])
      )
    } else if (i < 25) {
      if (!rows.includes(row4)) rows.push(row4)
      row4.addComponents(
        new MessageButton()
          .setCustomId(`download${i}`)
          .setLabel(scriptArray[i])
          .setStyle("SECONDARY")
          .setEmoji(emojis[i])
      )
    }
  }

  channel.messages.fetch().then((messages) => {
    if (messages.size != 0) {
      channel.messages.fetch().then((results) => {
        channel.bulkDelete(results)
      })
    }

    channel.send({ content: downloadMessage, components: rows })
  })
}
