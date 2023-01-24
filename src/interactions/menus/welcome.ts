import { Menu } from "../../structures/Interactions"

export default new Menu({
  customId: "welcome",
  type: 3,
  run: async ({ interaction }) => {
    await interaction.deferReply({ ephemeral: true })

    const member = interaction.guild.members.cache.find(
      (member) => member.id === interaction.user.id
    )

    if (interaction.values.length === 0) return

    if (interaction.values.includes("botter")) {
      member.roles.remove("864744526894333963")
      member.roles.add("901892382616846366")
    } else if (interaction.values.includes("developer")) {
      member.roles.remove("901892382616846366")
      member.roles.add("864744526894333963")
    }

    interaction
      .editReply({
        content: `Welcome aboard <@${interaction.user.id}>! If you are new to Simba, I highly recommend you visit <https://waspscripts.com>`,
      })
      .catch(console.error)
  },
})
