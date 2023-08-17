declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN: string
			GUILD_ID: string
			SB_URL: string
			SB_ANON_KEY: string
			SERVICE_USER: string
			SERVICE_PASS: string
			ENVIRONMENT: "dev" | "production" | "debug"
		}
	}
}

export {}
