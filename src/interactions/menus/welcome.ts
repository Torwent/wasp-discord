import { Menu } from "../../structures/Interactions"

export default new Menu({
  customId: "welcome",
  type: 3,
  run: async ({ interaction }) => {
    const member = interaction.guild.members.cache.find(
      (member) => member.id === interaction.user.id
    )

    if (interaction.customId === "welcome") {
      if (interaction.values.length != 0) {
        if (interaction.values.includes("botter")) {
          member.roles.remove("864744526894333963")
          member.roles.add("901892382616846366")
        } else if (interaction.values.includes("developer")) {
          member.roles.remove("901892382616846366")
          member.roles.add("864744526894333963")
        }

        interaction.channel
          .send({
            content: `Welcome aboard <@${interaction.user.id}>! If you are new to Simba, I highly recommend you visit https://waspscripts.com`,
          })
          .then((msg) => {
            setTimeout(() => msg.delete(), 20000)
          })
          .catch(console.error)
      }
    }
  },
})
