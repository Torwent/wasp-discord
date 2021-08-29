const coinbase = require("coinbase-commerce-node")
const { coinbaseAPIKey } = require("../config.json")
const Client = coinbase.Client
const Charge = coinbase.resources.Charge

module.exports = (user) => {
  const clientObj = Client.init(coinbaseAPIKey)
  clientObj.setRequestTimeout(3000)

  var chargeData = {
    name: "Permanent Premium role",
    description: "One time payment for the WaspBots Premium role.",
    local_price: {
      amount: "30.00",
      currency: "EUR",
    },
    pricing_type: "fixed_price",
    metadata: {
      discord_user_id: `${user.id}`,
    },
    payments: [],
  }

  return new Charge(chargeData)
}
