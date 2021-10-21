const zeroPad = (num, places) => String(num).padStart(places, '0')

const addReactions = (message, reactions) => {
  message.react(reactions[0])
  reactions.shift()

  reactions.length > 0 &&
    setTimeout(() => addReactions(message, reactions), 750)
}

module.exports = {
    commands: ["poll", "p"],
    expectedArgs: "poll add/close question/pollNum answer0...answer9]",
    permissionError: "You need admin permissions to run this command.",
    minArgs: 1,
    maxArgs: null,
    callback: (message, arguments, text) => {
        let ch = message.channel
        let pollNum
        
        ch.messages.fetch().then(messages => {
            let msgs = Array.from(messages.values());

            if ((arguments[0].toLowerCase() == "add") || (arguments[0].toLowerCase() == "open")) {
                if (typeof msgs[1] == "undefined") {
                   pollNum = 0 
                }
                else {
                    pollNum = parseInt(msgs[1].content.substring(8,12))

                    if (isNaN(pollNum)) {
                        pollNum = 0
                    } else {
                        pollNum += 1 
                    }
                }

                console.log("Poll number created: " + pollNum)

                text = text.replace(/(add )/gi, "")
                let questionText = text.split(/(?=[?:])|(?<=[?:])/g, 2).join("")

                text = text.replace(/^(.*?)\? /, "")
                let options = text.split(/([!?.;])/)
                        
                for (let i = 1; i < options.length - 1; i++) { 
                    while (typeof options[i] != 'undefined' && options[i].length <= 1) {
                        options[i - 1] += options[i]
                        options.splice(i, 1)
                    }
                }

                for (const index in options) {
                    options[index] = options[index].replace(/^\s+|\s+$/g,"")
                }

                let emojis

                if (options.length <= 2) {
                    emojis = ["👍", "👎"]
                } else {
                    emojis = ["0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
                }

                emojis.splice(options.length)

                let pollMessage = `**Poll #${zeroPad(pollNum, 4)}**\n\n`
                pollMessage += `${questionText}\n\n`
                
                for (const index in options) {
                    options[index] = `${emojis[index] + options[index]}\n`
                    pollMessage += options[index]
                }

                pollMessage += "\n**Poll is open**"

                ch.send(pollMessage).then( msg => {
                    addReactions(msg, emojis)
                }).catch(console.error)       
            }
            else if (arguments[0].toLowerCase() == "close") { 
                    pollNum = arguments[1]
                    console.log("Closing poll number: " + pollNum)
                    let msg

                    for (msg of msgs) {
                        if (msg.content.includes("#" + zeroPad(pollNum, 4))) break
                    }

                    let msgEnding = `**Poll is now closed**\n\n`   
                    let reactions = msg.reactions.cache
                    let reaction
                    let emojis = ["👍", "👎", "0️⃣", "1️⃣", "2️⃣", "3️⃣", "4️⃣", "5️⃣", "6️⃣", "7️⃣", "8️⃣", "9️⃣"]
                    let counter

                    for (const index in emojis) {
                        reaction = reactions.get(emojis[index])
                        if (typeof reaction == "undefined") continue

                        counter = reaction.count - 1
                        if (counter > 0) msgEnding += `${reaction._emoji.name + counter} people.\n`
                    }
                    msgEnding += `_ _`

                    msg.edit(msg.content.replace("**Poll is open**", msgEnding))         
            }
            
            message.delete()
        })
            .catch(console.error)
    },
    permissions: ["ADMINISTRATOR"],
    requiredRoles: ["Server Owner"],
}