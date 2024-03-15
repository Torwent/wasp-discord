declare global {
	namespace NodeJS {
		interface ProcessEnv {
			BOT_TOKEN: string
			GUILD_ID: string
			SB_URL: string
			SERVICE_KEY: string
			ENVIRONMENT: "dev" | "production" | "debug"
		}
	}
}

export {}
