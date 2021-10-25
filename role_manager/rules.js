const { MessageActionRow, MessageButton } = require("discord.js")

const config = require("../config.json").discord

const channelID = config.channels.rules

const rulesMessage = `**Rules of the WaspBot server**

**1. Do not PM staff**
If there's a channel for your question/topic of conversation it should go there.
Coding questions should go in the @Developer channels.

**2. Be Respectful**
You must respect all users, regardless of your liking towards them.

**3. Inappropriate Language**
The use of profanity should be kept to a minimum. However, any derogatory language towards any user is prohibited.

**4. Spamming**
Avoid sending a lot of small messages right after each other. Do not disrupt chat by spamming.

**5. NSFW material**
This is a community server and not meant to share this kind of material.

**6. Advertisements**
We do not tolerate any kind of advertisements. It's okay to talk about other products but blatant advertisement is not allowed.

**7. No offensive names/profile pictures**
You will be asked to change your name/picture if the staff deems them inappropriate.

**8. Server Raiding**
Raiding or mentions of raiding are not allowed.

**9. Threats**
Threats of any kind to anyone are prohibited and disallowed.

**10. Racism**
Racism is prohibited and disallowed.

**11. Keep it English**
Main channels are for English communication only. For other languages check the Multi Language Category.

**12. Begging**
Begging of any kind is  prohibited and disallowed.

**13. Sharing Scripts**
Sharing snippets to fix bugs is fine, but sharing full scripts in the main channels is not allowed and should only be done in the @Developer channels.
As a @Developer you are responsible for reviewing any 3rd party script you download and we are not responsible for any damages they might cause.

**14. Follow the Discord Community Guidelines**
You can find them here: https://discordapp.com/guidelines


**Your presence in this server implies accepting these rules, including all further changes.**
**These changes might be done at any time without notice, it is your responsibility to check for them.**`

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
