const { realBot } = require("../config.json")
const { botID } = require("../config.json")
const { devBotID } = require("../config.json")
const { premiumRole } = require("../config.json")
const firstMessage = require("../channel_manager/first-message")
const openTicket = require("./open")

module.exports = (client) => {
  //comment out to test
  //if (!realBot) return

  const getEmoji = (emojiName) =>
    client.emojis.cache.find((emoji) => emoji.name === emojiName)

  const channelID = realBot ? "830549590327164964" : "878406756676567071"

  let reactText = `
You can buy <@&${premiumRole}> at:
https://upgrade.chat/waspbots

It can be bought as a weekly, monthly or yearly subscription that can be canceled at anytime or for a one time payment.

**Very Important:**
Make sure you set your discord username or are logged in into discord through upgrade.chat! Otherwise it will be considered a simple donation!

**You can also buy the permanent <@&${premiumRole}> method with crypto if you want with Coinbase commerce.**

When buying the role with crypto you are responsible for the transaction fees and the only crypto I accept are the ones accepted by Coinbase commerce.
Some of the main ones are:
> ${getEmoji("btc")} Bitcoin
> ${getEmoji("eth")} Ethereum
> ${getEmoji("dai")} Dai

The price with crypto is also lower due to lower fees on my side, but then again, at times of high crypto network activity, the fees you have to pay might do the transaction more expensive.
To buy Premium with crypto please open a ticket by reacting to this message with 🎟️.


With the <@&${premiumRole}> role you will be able to access all channels on this category.

Premium scripts are installed manually unlike the free scripts which use Simba's package manager.

I recommend <@&${premiumRole}> users to create the following folder:
`

  reactText += "```cmd\n"
  reactText += "C:SimbaScriptsPremiumWaspBots"
  reactText += "```"
  reactText += `And place any premium scripts downloaded there.


**If you just paid for <@&${premiumRole}> but still cannot see the channels**, first check if you already have the role (Yellow name in my server).
If you don't wait 5 minutes and see if it shows up. If you already have the role and still can't see the channels, try restarting your Discord client. Discord seems to be slow at updating permissions unfortunately. If that does not fix, as a last resort, try to logout of Discord and log back in.

Relogging should fix the issue, if it does not, feel free to contact me, I'll help you out as soon as I am free!`

  firstMessage(client, channelID, reactText, ["🎟️"])

  const handleReaction = (reaction, user, add) => {
    if (user.id === botID || user.id === devBotID) return

    const emoji = reaction._emoji.name

    if (emoji !== "🎟️" || !add) return

    const { guild } = reaction.message

    const member = guild.members.cache.find((member) => member.id === user.id)

    const userTag = member.user.username + member.user.discriminator

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
