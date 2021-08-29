const path = require("path")
const fs = require("fs")
const discord = require("discord.js")
const client = new discord.Client({
  intents: ["GUILDS", "GUILD_MESSAGES", "GUILD_MESSAGE_REACTIONS"],
})

const config = require("./config.json")

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

})

config.realBot ? client.login(config.token) : client.login(config.devToken)
