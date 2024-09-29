import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types/supabase"

const options = { auth: { persistSession: false } }
export const supabase = createClient<Database>(process.env.SB_URL, process.env.SERVICE_KEY, options)

export async function getWSID(user: string) {
	const { data, error } = await supabase
		.schema("profiles")
		.from("profiles")
		.select("id")
		.eq("discord", user)
		.limit(1)
		.maybeSingle()

	if (error) {
		console.error(error)
		return null
	}

	if (data == null) return null

	return data.id
}
