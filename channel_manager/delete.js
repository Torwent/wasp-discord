module.exports = (channel, time, warn) => {
  warn && channel.send(`Deleting the channel in ${time / 1000} seconds.`)
  setTimeout(() => channel.delete(), time)
}
