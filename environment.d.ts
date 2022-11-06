declare global {
  namespace NodeJS {
    interface ProcessEnv {
      botToken: string
      guildId: string
      sbURL: string
      sbAnonKey: string
      environment: "dev" | "prod" | "debug"
    }
  }
}

export {}
