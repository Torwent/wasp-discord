const m = require("mongoose")

const userSchema = m.Schema({
  UserID: {
    type: String,
    required: true,
  },
  RoleIDs: [String],
})

module.exports = m.model("user", userSchema)
