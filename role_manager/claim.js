const { realBot } = require("../config.json")
const { botID } = require("../config.json")
const { devBotID } = require("../config.json")
const firstMessage = require("../channel_manager/first-message")

module.exports = (client) => {
  //comment out to test
  if (!realBot) return

  var channelID

  channelID = realBot ? "864745341109927967" : "878406756676567071"

  console.log(channelID)

  const emojis = {
    "🤖": "Developer",
  }

  const reactions = []

  let reactText

  reactText += `**Welcome to the developer section!**\n\n`
  reactText += `In this section you can share your scripts if you want and get help with coding issues you night be facing.\n\n`
  reactText += `**Keep in mind that even though I'll try review all posted scripts, I might not have time to do so sometimes and they could be malicious.\n\n`
  reactText += `Use them at you own risk!**\n\n`
  reactText += `**You can also find Simba tutorials that will start from very basic to advanced from top to bottom.**\n\n`
  reactText += `Keep in mind that I've never actually studied programming and I try to explain things the way I understand them.\n`
  reactText += `If you know more than me and you see something I'm not exactly explaining things properly, let me know.\n\n`

  for (const key in emojis) {
    const emoji = key
    reactions.push(emoji)

    const role = emojis[key]
    reactText += `To become a **${role}** click the ${emoji} icon below.\n`
  }

  firstMessage(client, channelID, reactText, reactions)

  const handleReaction = (reaction, user, add) => {
    if (user.id === botID || user.id === devBotID) return

    const emoji = reaction._emoji.name

    const { guild } = reaction.message

    const roleName = emojis[emoji]
    if (!roleName) return

    const role = guild.roles.cache.find((role) => role.name === roleName)
    const member = guild.members.cache.find((member) => member.id === user.id)

    add ? member.roles.add(role) : member.roles.remove(role)
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
