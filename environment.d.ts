declare module "bun" {
	interface Env {
		BOT_TOKEN: string
		GUILD_ID: string
		SB_URL: string
		SB_ANON_KEY: string
		SERVICE_KEY: string
	}
}

export {}
