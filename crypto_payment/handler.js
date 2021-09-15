"use strict"

const Express = require("express")
const Webhook = require("coinbase-commerce-node").Webhook
const { secret } = require("../config.json").coinbase
const { premiumRole } = require("../config.json").discord
const delChannel = require("../channel_manager/delete")

const router = Express.Router()
const app = Express()

function rawBody(req, res, next) {
  req.setEncoding("utf8")

  var data = ""

  req.on("data", function (chunk) {
    data += chunk
  })

  req.on("end", function () {
    req.rawBody = data

    next()
  })
}

module.exports.listen = async (client) => {
  router.post("/", function (request, response) {
    var event

    try {
      event = Webhook.verifyEventBody(
        request.rawBody,
        request.headers["x-cc-webhook-signature"],
        secret
      )

      if (
        !event ||
        !event.id ||
        !event.data.metadata.discord_guild_id ||
        !event.data.metadata.discord_user_id ||
        !event.data.metadata.discord_channel_id
      )
        return

      console.log("Success", event.id)

      let guild = client.guilds.cache.get(event.data.metadata.discord_guild_id)
      let user = client.users.cache.get(event.data.metadata.discord_user_id)
      let channel = client.channels.cache.get(
        event.data.metadata.discord_channel_id
      )
      let msgText

      if (event.type === "charge:created") {
        console.log("Webhook: charge:created")
        let member = guild.members.cache.find((member) => member.id === user.id)
        if (member && member.roles.cache.has(premiumRole)) {
          setTimeout(() => {
            if (channel) {
              channel.send(
                `<@${user.id}> You already have <@&${premiumRole}> role.`
              )
              delChannel(channel, 10000, true)
            }
          }, 10000)
        }
      }

      if (event.type === "charge:pending") {
        console.log("Webhook: charge:pending")
        if (channel) {
          msgText = `<@${user.id}> thank you for your payment.\n`
          msgText += `Your payment is now pending, once coinbase validates the payment this ticket will be deleted and you will be receive a private message notifying you.`
          channel.send(msgText)
        }
      }

      if (event.type === "charge:confirmed") {
        console.log("Webhook: charge:confirmed")
        let member = guild.members.cache.find((member) => member.id === user.id)

        let notificationCh = client.channels.cache.get("830446743027187722")
        notificationCh.Send(
          `<@${user.id}> just joined the Premium role via Coinbase!`
        )

        if (member) {
          member.roles.add(premiumRole)
          msgText = `<@${user.id}> your payment for the Premium role in the WaspBots server was received.\n`
          msgText += `Thank you very much!`
          user.send(msgText)
        } else {
          console.log(`${user.username}#${user.discriminator} left the guild.`)
          msgText = `<@${user.id}> your payment for the Premium role in the WaspBots server was received.\n`
          msgText += `However, you seem to have left WaspBots. Contact support if you want to rejoin or want a refund.`
          user.send(msgText)
        }

        channel && delChannel(channel, 3000, false)
      }

      if (event.type === "charge:failed") {
        console.log("Webhook: charge:failed")
        if (channel) {
          msgText = `<@${user.id}> for some reason your payment failed.\n`
          msgText += `Your money was returned to you, if you want you can try again using the same link.`
          channel.send(msgText)
        }
      }

      if (response)
        response.status(200).send("Signed Webhook Received: " + event.id)
    } catch (error) {
      console.log("Error occured", error.message)

      return response.status(400).send("Webhook Error:" + error.message)
    }
  })

  app.use(rawBody)
  app.use(router)
  app.listen(3000, function () {
    console.log("Listening for coinbase webhooks on port 3000!")
  })
}
