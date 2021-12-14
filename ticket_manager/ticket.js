const config = require("../config.json").discord
const firstMessage = require("../channel_manager/first-message")
const openTicket = require("./open")
const premium = config.roles.premium

module.exports = (client) => {
  //comment out to test
  if (!config.realBot) return

  const getEmoji = (emojiName) =>
    client.emojis.cache.find((emoji) => emoji.name === emojiName)

  const channelID = config.realBot
    ? config.channels.premInfo
    : config.channels.management

  let reactText = `You can buy <@&${premium}> at: https://upgrade.chat/waspbots\n\n`
  reactText += `It can be bought as a weekly, monthly or yearly subscription or for a one time payment.\n\n`

  reactText += `**Make sure you set your discord username or are logged in through upgrade.chat!**\n`
  reactText += `Otherwise it will be considered a simple donation!\n\n`

  reactText += `Some of the main cryptos accepted are:\n`
  reactText += `> ${getEmoji("btc")} Bitcoin\n> ${getEmoji(
    "eth"
  )} Ethereum\n> ${getEmoji("dai")} Dai\n`
  reactText += `The price with crypto is lower due to lower fees on my side, but then again, at times of high network activity, the fees you have to pay might make it more expensive for you.\n`
  reactText += `To buy <@&${premium}> with crypto please open a ticket by reacting to this message with 🎟️.\n\n`

  reactText += `With the <@&${premium}> role you will be able to access the premium <#906170516795170847> channel which has the following scripts:\n`
  reactText += `> Agility\n> Combiner\n> Anvil smither\n> Astral runecrafter\n> Combiner\n`
  reactText += `> Fletcher\n> Herblore\n> Motherload mine\n> Pest control\n> Rod fisher\n`
  reactText += `> Script chainer\n> Zeah runecrafter\n\n`

  reactText += `Premium scripts are installed manually unlike the free scripts which use Simba's package manager.\n`
  reactText += `I recommend <@&${premium}> users to create the following folder:\n`

  reactText += "```cmd\n"
  reactText += "C:\\Simba\\Scripts\\PremiumWaspBots\n"
  reactText += "```"
  reactText += `And place any premium scripts downloaded there.\n\n`

  reactText += `**If you just paid for <@&${premium}> but still cannot see the channels**, first check if you already have the role (Yellow name in my server).\n`
  reactText += `If you don't wait 5 minutes and see if it shows up. If you already have the role and still can't see the channels, try restarting your Discord client.`
  reactText += `Discord seems to be slow at updating permissions unfortunately. If that does not fix, as a last resort, try to logout of Discord and log back in.\n\n`

  reactText += `Relogging should fix the issue, if it does not, feel free to contact me, **I'll help you out as soon as I am free!**`

  firstMessage(client, channelID, reactText, ["🎟️"])

  const handleReaction = (reaction, user, add) => {
    if (user.id === config.mainBot.id || user.id === config.devBot.id) return

    const emoji = reaction._emoji.name

    if (emoji !== "🎟️" || !add) return

    const { guild } = reaction.message
    const member = guild.members.cache.find((member) => member.id === user.id)

    openTicket(client, guild, member.user)
  }

  client.on("messageReactionAdd", (reaction, user) => {
    reaction.message.channel.id === channelID &&
      handleReaction(reaction, user, true)
  })

  client.on("messageReactionRemove", (reaction, user) => {
    reaction.message.channel.id === channelID &&
      handleReaction(reaction, user, false)
  })
}
