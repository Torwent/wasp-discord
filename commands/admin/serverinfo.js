const { DiscordAPIError, MessageEmbed } = require("discord.js")

module.exports = {
    commands: ['serverinfo', 'sinfo', 'si'],
    expectedArgs: '',
    permissionError: 'You need admin permissions to run this command',
    minArgs: 0,
    maxArgs: 0,
    callback: (message, arguments, text) => {
        const guild = message.guild;
        const members = guild.members.cache;
        const owner = members.find(member => member.id === guild.ownerId);

        const siEmbed = new MessageEmbed()
            .setTitle(guild.name)
            .setThumbnail(guild.iconURL())
            .setColor("RANDOM")
            .addFields(
                { name: "Server ID:", value: guild.id },
                { name: "Server name:", value: guild.name },
                { name: "Owner:", value: `${owner.user.username}#${owner.user.discriminator}` },
            )
            
            message.channel.send({ embeds: [siEmbed] })
    },
    permissions: ['ADMINISTRATOR'],
    requiredRoles: [],
}