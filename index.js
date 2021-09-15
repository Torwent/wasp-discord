const path = require("path")
const fs = require("fs")
const discord = require("discord.js")
const mongoose = require("mongoose")

const config = require("./config.json")

mongoose
  .connect(
    `mongodb+srv://${config.mongodb.user}:${config.mongodb.password}@waspbotserver.4ccjh.mongodb.net/Data`,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }
  )
  .then(console.log("Connected to mongo db!"))

const client = new discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"],
})

const roleClaim = require("./role_manager/claim")
const ticketManager = require("./ticket_manager/ticket")
const coinbaseWebhook = require("./crypto_payment/handler")

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

  roleClaim(client)
  ticketManager(client)
  coinbaseWebhook.listen(client)
  commandBase.listen(client)
})

config.discord.realBot
  ? client.login(config.discord.mainBot.token)
  : client.login(config.discord.devBot.token)
