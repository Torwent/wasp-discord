const { botID } = require("../config.json")
const { devBotID } = require("../config.json")
const { ticketCategoryID } = require("../config.json")
const { premiumRole } = require("../config.json")

const firstMessage = require("../channel_manager/first-message")
const deleteMessage = require("../channel_manager/delete")
const cryptoCharge = require("../crypto_payment/create")

module.exports = async (client, guild, user) => {
  const ticketName = `ticket-${user.id}`
  if (guild.channels.cache.find((c) => c.name === ticketName)) return

  const getEmoji = (emojiName) =>
    client.emojis.cache.find((emoji) => emoji.name === emojiName)

  let channel = await guild.channels.create(ticketName, { type: "text" })
  await channel.setParent(ticketCategoryID)

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

  let chargeObj = cryptoCharge(user)

  chargeObj
    .save()
    .then(function (response) {
      console.log(`Created charge for ${user.id}`)

      if (response && response.hosted_url) {
        let msgText = `Thank you for contacting support and considering buying <@&${premiumRole}> with crypto.\n\n`
        msgText += `You can use this link to purchase <@&${premiumRole}> with any crypto currency supported by coinbase commerce.\n`
        msgText += `${response.hosted_url}\n\n`
        msgText += `A Coinbase account is not required.\n\n`
        msgText += `To delete the ticket react with ⛔.\n`
        msgText += `Do not delete the ticket after donating. Doing so might result in the money being lost.\n`
        msgText += `The ticket will automatically be deleted after one hour or after the transaction is confirmed.\n`

        firstMessage(client, channel.id, msgText, ["⛔"])
      }
    })
    .catch(function (error) {
      console.log(error)
    })

  const handleReaction = (reaction, user, add) => {
    if (user.id === botID || user.id === devBotID || !add) return

    channel.messages.fetch().then((messages) => {
      for (const message of messages) message[1].delete()
    })

    if (reaction.emoji.name === "⛔") deleteMessage(channel, 5000, true)
  }

  client.on("messageReactionAdd", (reaction, user) => {
    reaction.message.channel.id === channel.id &&
      handleReaction(reaction, user, true)
  })
}
