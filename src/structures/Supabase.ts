import { createClient } from "@supabase/supabase-js"

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

  return session != null
}

export async function login() {
  console.log("Logging in to supabase")
  const { error } = await supabase.auth.signInWithPassword({
    email: process.env.SERVICE_USER,
    password: process.env.SERVICE_PASS,
  })
  if (error) console.error(error)
}
