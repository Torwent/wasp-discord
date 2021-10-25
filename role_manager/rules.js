const { MessageActionRow, MessageButton } = require("discord.js")

const config = require("../config.json").discord

const channelID = config.channels.rules

const rulesMessage = `**Rules of the WaspBot server**

**1. Do not PM staff**
If there's a channel for your question or topic of conversation it should go there.
Coding questions should go in #💬chat which you can access by reacting to the message in #❗information.

**2. Be respectful**
You must respect all users, regardless of your liking towards them.

**3. No Inappropriate Language**
The use of profanity should be kept to a minimum. However, any derogatory language towards any user is prohibited.

**4. No spamming**
Avoid sending a lot of small messages right after each other. Do not disrupt chat by spamming.

**5. No NSFW material**
This is a community server and not meant to share this kind of material.

**6. No advertisements**
We do not tolerate any kind of advertisements. We do not mind talking about other products but blatant advertisement is not allowed.

**7. No offensive names/profile pictures**
You will be asked to change your name or picture if the staff deems them inappropriate.

**8. Server Raiding**
Raiding or mentions of raiding are not allowed.

**9. Direct/Indirect Threats**
Threats of any kind to another user are absolutely prohibited and disallowed.

**10. No Racism**
Racism is absolutely prohibited and disallowed.

**11. English only in the main channels**
The main channels are for English communication only. For other languages check the Multi Language Category.

**12. No begging**
Begging for money, bonds or any kind of donation is  prohibited and disallowed.

**13. Follow the Discord Community Guidelines**
You can find them here: https://discordapp.com/guidelines


**Your presence in this server implies accepting these rules, including all further changes.
These changes might be done at any time without notice, it is your responsibility to check for them.**`

module.exports = async (client) => {
  if (!config.realBot) return

  const channel = await client.channels.fetch(channelID)

  const row = new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId("acceptrules")
      .setLabel("I  accept the rules of this server!")
      .setStyle("SECONDARY")
      .setEmoji("✅")
  )

  channel.messages.fetch().then((messages) => {
    if (messages.size != 0) {
      channel.messages.fetch().then((results) => {
        channel.bulkDelete(results)
      })
    }

    channel.send({ content: rulesMessage, components: [row] })
  })
}
