const coinbase = require("coinbase-commerce-node")
const { apiKey } = require("../config.json").coinbase
const Client = coinbase.Client
const Charge = coinbase.resources.Charge

module.exports = (guildID, user, channelID) => {
  const clientObj = Client.init(apiKey)
  clientObj.setRequestTimeout(3000)

  var chargeData = {
    name: "Permanent Premium role",
    description: `Permanent WaspBots Premium role for ${user.username}#${user.discriminator}.`,
    local_price: {
      amount: "30.00",
      currency: "EUR",
    },
    pricing_type: "fixed_price",
    metadata: {
      discord_guild_id: guildID,
      discord_user_id: user.id,
      discord_channel_id: channelID,
    },
    payments: [],
  }

  return new Charge(chargeData)
}
