const addReactions = (message, reactions) => {
  message.react(reactions[0])
  reactions.shift()

  reactions.length > 0 &&
    setTimeout(() => addReactions(message, reactions), 750)
}

module.exports = async (client, id, text, reactions = []) => {
  const channel = await client.channels.fetch(id)
  channel.messages.fetch().then((messages) => {
    // Send a new message
    if (messages.size === 0)
      channel.send(text).then((message) => addReactions(message, reactions))
    // Edit the existing message
    else
      for (const message of messages) {
        message[1].edit(text)
        addReactions(message[1], reactions)
      }
  })
}
