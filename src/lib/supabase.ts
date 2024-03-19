import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types/supabase"

const options = { auth: { persistSession: false } }
export const supabase = createClient<Database>(process.env.SB_URL, process.env.SERVICE_KEY, options)
