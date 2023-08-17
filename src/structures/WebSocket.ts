import webSocket from "ws"
import { ExtendedClient } from "./Client"

const wss = new webSocket.Server({ port: 4100 })

export const wssListen = async (client: ExtendedClient) => {
	console.log("Listening for websocket connections on port 4100!")

	wss.on("connection", (ws: webSocket) => {
		console.log("New client connected!")

		ws.on("message", (data: any) => {
			try {
				const user_id = `${data}`
				console.log("Requesting: ", user_id)
				console.log("ClientIsReady: ", client.isReady())
				const guild = client.guilds.resolve(process.env.GUILD_ID)
				console.log("guildname: ", guild.name)
				const member = guild.members.cache.get(user_id)
				console.log("member name: ", member.displayName)
				let memberRoles: string[] = []

				if (member != null)
					memberRoles = member.roles.cache
						.filter((roles: { id: string }) => roles.id !== guild.id)
						.map((role: { toString: () => any }) => role.toString())

				ws.send(memberRoles.toString())
			} catch (error) {
				console.error(error)
			}
		})

		ws.on("close", () => {
			console.log("Client has disconnected!")
		})
	})
}
