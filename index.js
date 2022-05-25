const path = require("path")
const fs = require("fs")
const { Client, Intents } = require("discord.js")

const config = require("./config.json")

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_INTEGRATIONS,

    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,

    Intents.FLAGS.DIRECT_MESSAGES,
    Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
    Intents.FLAGS.DIRECT_MESSAGE_TYPING,
    Intents.FLAGS.GUILD_PRESENCES,
  ],
})

const ticketManager = require("./ticket_manager/ticket")
const coinbaseWebhook = require("./crypto_payment/handler")
const wsServer = require("./websockets/wsserver")
const welcome = require("./role_manager/welcome")

client.once("ready", () => {
  console.log("Wasp Bot is ready!")

  const baseFile = "command-base.js"
  const commandBase = require(`./commands/${baseFile}`)

  const readCommands = (dir) => {
    const files = fs.readdirSync(path.join(__dirname, dir))
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file))
      if (stat.isDirectory()) readCommands(path.join(dir, file))
      else if (file !== baseFile) {
        const option = require(path.join(__dirname, dir, file))
        commandBase(option)
      }
    }
  }

  readCommands("commands")

  console.log("Finished loading commands.")

  welcome(client)
  ticketManager(client)
  coinbaseWebhook.listen(client)
  wsServer.listen(client)
  commandBase.listen(client)
})

config.discord.realBot
  ? client.login(config.discord.mainBot.token)
  : client.login(config.discord.devBot.token)
