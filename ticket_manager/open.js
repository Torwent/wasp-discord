const config = require("../config.json")

const firstMessage = require("../channel_manager/first-message")
const deleteChannel = require("../channel_manager/delete")
const cryptoCharge = require("../crypto_payment/create")

module.exports = async (client, guild, user) => {
  const ticketName = `ticket-${user.id}`
  if (guild.channels.cache.find((c) => c.name === ticketName)) return

  const getEmoji = (emojiName) =>
    client.emojis.cache.find((emoji) => emoji.name === emojiName)

  let channel = await guild.channels.create(ticketName, { type: "text" })
  await channel.setParent(config.discord.ticketCategory)

  channel.permissionOverwrites.set([
    {
      id: guild.id,
      deny: ["VIEW_CHANNEL", "SEND_MESSAGES"],
    },
    {
      id: user.id,
      allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
    },
  ])

  let chargeObj = cryptoCharge(channel.guildId, user, channel.id)

  chargeObj
    .save()
    .then(function (response) {
      console.log(
        `Created charge with ChargeID: ${response.id} for DiscordUserID: ${user.id}`
      )

      if (response && response.hosted_url) {
        let msgText = `Thank you for contacting support and considering buying <@&${config.discord.premiumRole}> with crypto.\n\n`
        msgText += `You can use this link to purchase <@&${config.discord.premiumRole}> with any crypto currency supported by coinbase commerce.\n`
        msgText += `${response.hosted_url}\n\n`
        msgText += `A Coinbase account is not required.\n\n`
        msgText += `To delete the ticket react with ⛔.\n`
        msgText += `Do not delete the ticket after donating. Doing so might result in the money being lost.\n`
        msgText += `The ticket will automatically be deleted after the transaction expires in 1 hour or is confirmed.\n`

        firstMessage(client, channel.id, msgText, ["⛔"])
      }
    })
    .catch(function (error) {
      console.log(error)
    })

  const handleReaction = (reaction, user, add) => {
    if (
      user.id === config.discord.mainBot.id ||
      user.id === config.discord.devBot.id
    )
      return

    channel.messages.fetch().then((messages) => {
      for (const message of messages) message[1].delete()
    })

    if (reaction.emoji.name === "⛔") deleteChannel(channel, 5000, true)
  }

  client.on("messageReactionAdd", (reaction, user) => {
    reaction.message.channel.id === channel.id &&
      handleReaction(reaction, user, true)
  })
}
