import webSocket from "ws"
import { ExtendedClient } from "./Client"

const wss = new webSocket.Server({ port: 4100 })

export const wssListen = async (client: ExtendedClient) => {
  console.log("Listening for websocket connections on port 4100!")
  wss.on("connection", (ws: webSocket) => {
    console.log("New client connected!")

    ws.on("message", (data: any) => {
      try {
        let user_id = `${data}`
        let guild = client.guilds.resolve(process.env.guildId)
        let member = guild.members.cache.get(user_id)
        let memberRoles = member.roles.cache
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
