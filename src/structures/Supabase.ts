import {
  RealtimeChannel,
  RealtimePostgresUpdatePayload,
  createClient,
} from "@supabase/supabase-js"
import { ExtendedClient } from "./Client"
import { ROLES } from "./Roles"
import { addNewUser, isUserModified } from "./users"

let realtime: RealtimeChannel

// Create a single supabase client for interacting with your database
export const supabase = createClient(
  process.env.SB_URL,
  process.env.SB_ANON_KEY,
  {
    auth: { autoRefreshToken: true, persistSession: false },
  }
)

export async function isLoggedIn() {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session == null) {
    realtime.unsubscribe()
    return false
  }

  return true
}

export async function login(client: ExtendedClient) {
  console.log("Logging in to supabase")
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.SERVICE_USER,
    password: process.env.SERVICE_PASS,
  })
  if (error) console.error(error)

  const guild = client.guilds.cache.get(process.env.GUILD_ID)

  realtime = supabase
    .channel("any")
    .on(
      "postgres_changes",
      {
        event: "UPDATE",
        schema: "public",
        table: "profiles_protected",
      },
      async (
        payload: RealtimePostgresUpdatePayload<{ [key: string]: any }>
      ) => {
        const id = payload.new.id
        const { data, error } = await supabase.rpc("get_discord_id", {
          user_id: id,
        })
        if (error) {
          console.error(error)
          return
        }

        const discordId = data as string

        if (await isUserModified(discordId)) {
          console.log(
            "Supabase - User with ID: ",
            discordId,
            " was recently modified."
          )
          return
        }

        const member = guild.members.cache.get(discordId)

        if (member) {
          Object.keys(ROLES).forEach((key) => {
            if (key !== "administrator") {
              if (payload.new[key]) member.roles.add(ROLES[key])
              else member.roles.remove(ROLES[key])
            }
          })

          await addNewUser(discordId, 2 * 60)
        }
      }
    )
    .subscribe()
}
