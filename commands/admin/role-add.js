const userSchema = require("../../role_manager/user-schema")

module.exports = {
  commands: ["add", "role-add", "roleadd"],
  expectedArgs: "roleID @user",
  permissionError: "You need admin permissions to run this command",
  minArgs: 2,
  maxArgs: 3,
  callback: (message, args, text) => {
    const role = `${args[0].replace(/<@&/, "").replace(/>/, "")}`
    const member = `${args[1].replace(/<@!/, "").replace(/>/, "")}`

    if (!member) return message.reply("Please specify a valid member.")

    userSchema.findOne(
      {
        UserID: member,
      },
      async (err, data) => {
        if (data) {
          userSchema.findOneAndUpdate(
            { UserID: member },
            {
              $push: {
                RoleIDs: role,
              },
            }
          )
          return message.reply(`<@${member}> data was updated!`)
        }

        new userSchema({
          UserID: member,
          RoleIDs: [role],
        }).save()

        return message.reply(`Added <@${member}> to the database!`)
      }
    )
  },
  permissions: ["ADMINISTRATOR"],
  requiredRoles: ["Server Owner"],
}
