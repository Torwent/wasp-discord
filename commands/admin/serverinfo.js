const { DiscordAPIError, MessageEmbed } = require("discord.js")

module.exports = {
    commands: ['serverinfo', 'sinfo', 'si'],
    expectedArgs: '',
    permissionError: 'You need admin permissions to run this command',
    minArgs: 0,
    maxArgs: 0,
    callback: (message, arguments, text) => {
        const guild = message.guild;
        const embed = new MessageEmbed()
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL())
            .setColor("RANDOM")
            .addField('General Info', [
                `ID: ${guild.id}`,
                `Name: ${guild.name}`,
                `Owner: ${guild.owner}`,
            ])
            .addField('Counts', [
                `Role: ${
                            guild.roles.cache.size
                        } roles`,
                `Channels: ${
                                guild.channels.cache.filter((ch) => ch.type === "text" || ch.type === "voice").size
                            } total (Text: ${
                                guild.channels.cache.filter((ch) => ch.type === "text").size
                            }, Voice: ${
                                guild.channels.cache.filter((ch) => ch.type === "voice").size
                            })`,
                `Emojis: ${
                                guild.emojis.cache.size
                            } (Regular: ${
                                guild.emojis.cache.filter((e) => !e.animated).size
                            }, Aminated: ${
                                guild.emojis.cache.filter((e) => e.animated).size
                            })`,
            ])
            .addField('Additional Information', [
                `Region: ${guild.region}`    
            ])

            message.channel.send(embed)
    },
    permissions: ['ADMINISTRATOR'],
    requiredRoles: [],
}