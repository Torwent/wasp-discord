import { Events } from "discord.js"
import { ExtendedClient } from "./Client"
import { isLoggedIn, login, supabase } from "./Supabase"
import { addNewUsers, userModified } from "./users"

export const ROLES =
  process.env.ENVIRONMENT === "production"
    ? {
        administrator: "816271648118013953",
        moderator: "1018906735123124315",
        scripter: "1069140447647240254",
        tester: "907209408860291113",
        vip: "931167526681972746",
        premium: "820985772140134440",
        developer: "864744526894333963",
        timeout: "1102052216157786192",
      }
    : {
        administrator: "1067734814796550181",
        moderator: "1067734814796550180",
        scripter: "1115527233277272116",
        tester: "1067734814796550179",
        vip: "1067734814796550178",
        premium: "1067734814796550177",
        developer: "1067734814796550176",
        timeout: "1115527081745465375",
      }

export const roleListen = async (client: ExtendedClient) => {
  console.log("Listening for role changes!")
  await login(client)

  client.on(Events.GuildMemberUpdate, async (user) => {
    if (process.env.ENVIRONMENT !== "production") {
      console.log("Not in prodution, role updating will be skipped.")
      return
    }

    if (await userModified(user.id)) {
      console.log(
        "Discord - User with ID: ",
        user.id,
        " was recently modified."
      )
      return
    }

    const updatedUser = user.guild.members.cache.get(user.id)
    const roles = updatedUser.roles.cache

    const loggedIn = await isLoggedIn()
    if (!loggedIn) await login(client)

    console.log("Updating user: ", user.id)

    const { data, error: IDError } = await supabase
      .from("profiles_public")
      .select("id")
      .eq("discord_id", user.id)

    if (IDError) {
      console.error(IDError)
      return
    }

    const { id } = data[0]

    const { error } = await supabase
      .from("profiles_protected")
      .update({
        administrator: roles.has(ROLES.administrator),
        moderator: roles.has(ROLES.moderator),
        scripter: roles.has(ROLES.scripter),
        tester: roles.has(ROLES.tester),
        vip: roles.has(ROLES.vip),
        premium: roles.has(ROLES.premium),
        developer: roles.has(ROLES.developer),
        timeout: roles.has(ROLES.timeout),
      })
      .eq("id", id)

    await addNewUsers(user.id)

    if (error) {
      console.error(error)
      return
    }
  })
}
