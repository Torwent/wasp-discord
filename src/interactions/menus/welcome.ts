import { Menu } from "../../structures/Interactions"

const OSRSBOTTER_ROLE_ID =
  process.env.environment === "prod"
    ? "901892382616846366"
    : "1067734814796550175"

const DEVELOPER_ROLE_ID =
  process.env.environment === "prod"
    ? "864744526894333963"
    : "1067734814796550176"

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
      member.roles.remove(DEVELOPER_ROLE_ID)
      member.roles.add(OSRSBOTTER_ROLE_ID)
    } else if (interaction.values.includes("developer")) {
      member.roles.remove(OSRSBOTTER_ROLE_ID)
      member.roles.add(DEVELOPER_ROLE_ID)
    }

    interaction
      .editReply({
        content: `Welcome aboard <@${interaction.user.id}>! If you are new to Simba, I highly recommend you visit <https://waspscripts.com>`,
      })
      .catch(console.error)
  },
})
