const WebSocket = require("ws").Server
const HttpsServer = require("https").createServer
const fs = require("fs")

server = HttpsServer({
  cert: fs.readFileSync("/etc/letsencrypt/live/waspscripts.com/cert.pem"),
  key: fs.readFileSync("/etc/letsencrypt/live/waspscripts.com/privkey.pem"),
})
socket = new WebSocket({
  server: server,
})

//const wss = new webSocket.Server({ port: 4100 })

module.exports.listen = async (client) => {
  console.log("Listening for websocket connections on port 4100!")

  socket.on("connection", (ws) => {
    console.log("New client connected!")

    ws.on("message", (data) => {
      try {
        let user_id = `${data}`
        let guild = client.guilds.resolve("795071177475227709")
        let member = guild.members.cache.get(user_id)
        let memberRoles = member.roles.cache
          .filter((roles) => roles.id !== guild.id)
          .map((role) => role.toString())
        ws.send(memberRoles.toString())
      } catch (error) {
        console.log(error)
      } finally {
        ws.close()
      }
    })

    ws.on("close", () => {
      console.log("Client has disconnected!")
    })
  })
}

server.listen(4100)
