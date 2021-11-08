const { prefix, realBot, channels, roles } = require("../config.json").discord

const validatePermissions = (permissions) => {
  const validPermissions = [
    "CREATE_INSTANT_INVITE",
    "KICK_MEMBERS",
    "BAN_MEMBERS",
    "ADMINISTRATOR",
    "MANAGE_CHANNELS",
    "MANAGE_GUILD",
    "ADD_REACTIONS",
    "VIEW_AUDIT_LOG",
    "PRIORITY_SPEAKER",
    "STREAM",
    "VIEW_CHANNEL",
    "SEND_MESSAGES",
    "SEND_TTS_MESSAGES",
    "MANAGE_MESSAGES",
    "EMBED_LINKS",
    "ATTACH_FILES",
    "READ_MESSAGE_HISTORY",
    "MENTION_EVERYONE",
    "USE_EXTERNAL_EMOJIS",
    "VIEW_GUILD_INSIGHTS",
    "CONNECT",
    "SPEAK",
    "MUTE_MEMBERS",
    "DEAFEN_MEMBERS",
    "MOVE_MEMBERS",
    "USE_VAD",
    "CHANGE_NICKNAME",
    "MANAGE_NICKNAMES",
    "MANAGE_ROLES",
    "MANAGE_WEBHOOKS",
    "MANAGE_EMOJIS",
  ]

  for (const permission of permissions)
    if (!validPermissions.includes(permission))
      throw new Error(`Unknown permission node "${permission}"`)
}

const allCommands = {}

module.exports = (commandOptions) => {
  let { commands, permissions = [] } = commandOptions

  //Ensure the command and aliases are in an array
  if (typeof commands === "string") commands = [commands]

  console.log(`Command "${commands[0]}" registered ✅`)

  //Ensure the permissions are in an array and are all valid
  if (permissions.length) {
    typeof persmissions === "string" && (permissions = [permissions])
    validatePermissions(permissions)
  }

  for (const command of commands)
    allCommands[command] = {
      ...commandOptions,
      commands,
      permissions,
    }
}

module.exports.listen = (client) => {
  //Listen for messages.
  client.on("messageCreate", (message) => {
    const { member, content, guild, webhookId } = message

    if (webhookId) {
      message.attachments.forEach((attachment) => {
        if (
          attachment.name.includes(".simba") ||
          attachment.name.includes(".zip")
        )
          message.pin()
      })
      return
    }

    //Split on any number of spaces.
    const args = content.split(/[ ]+/) //this breaks prettier.

    //Remove the command
    const name = args.shift().toLowerCase()

    if (name.startsWith(prefix)) {
      const command = allCommands[name.replace(prefix, "")]
      if (!command) return

      //A command has been run.
      const {
        permissions,
        permissionError = "You do not have permission to run this command.",
        requiredRoles = [],
        minArgs = 0,
        maxArgs = null,
        expectedArgs,
        callback,
      } = command

      //DevBot only replies to admins.
      if (!realBot && !member.permissions.has("ADMINISTRATOR")) return

      //Ensure the user has the required permissions.
      for (const permission of permissions)
        if (!member.permissions.has(permission)) {
          message.reply(permissionError)
          return
        }

      //Ensure the user has the required roles.
      for (const requiredRole of requiredRoles) {
        const role = guild.roles.cache.find(
          (role) => role.name === requiredRole
        )

        if (!role || !member.roles.cache.has(role.id)) {
          message.reply(
            `You must have the "${requiredRole}" role to use this command.`
          )
          return
        }
      }

      //Ensure we have the correct number of arguments.
      if (args.length < minArgs || (maxArgs !== null && args.length > maxArgs))
        message.reply(`Incorrect syntax! Use ${prefix}${alias} ${expectedArgs}`)

      //Handle the custom command code.
      callback(message, args, args.join(" "))
    }
  })

  //Listen to button interactions
  client.on("interactionCreate", (interaction) => {
    interaction.deferUpdate()

    const member = interaction.guild.members.cache.find(
      (member) => member.id === interaction.user.id
    )

    //Button interactions
    if (interaction.isButton()) {
      if (interaction.customId === "acceptrules") {
        member.roles.add(roles.readrules)

        interaction.channel
          .send({
            content: `Thank you for accepting our rules <@${interaction.user.id}>! Head on to <#${channels.welcome}> to choose your role in the server.`,
          })
          .then((msg) => {
            setTimeout(() => msg.delete(), 20000)
          })
          .catch(console.error)
      }
    }

    //DropDown interactions
    else if (interaction.isSelectMenu()) {
      if (interaction.customId === "welcome") {
        if (interaction.values.length != 0) {
          if (interaction.values.includes("osrsbotter")) {
            member.roles.remove(roles.developer)
            member.roles.add(roles.osrsbotter)
          } else if (interaction.values.includes("developer")) {
            member.roles.remove(roles.osrsbotter)
            member.roles.add(roles.developer)
          }

          interaction.channel
            .send({
              content: `Welcome aboard <@${interaction.user.id}>! If you are new to Simba, I highly recommend you check <#${channels.setup}>.`,
            })
            .then((msg) => {
              setTimeout(() => msg.delete(), 20000)
            })
            .catch(console.error)
        }
      }
    }
  })
}
