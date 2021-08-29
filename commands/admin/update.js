module.exports = {
    commands: ['update', 'upload'],
    permissionError: '',
    minArgs: 0,
    maxArgs: 0,
    callback: (message, arguments, text) => {
        message.channel.messages.fetch().then((results) => {
            message.channel.send("Updating WaspBots Scripts");

            var now = new Date;
            var timestamp = "Uploaded on: " + now.toUTCString();

            //TODO: Change directory structure to be linux compatible.

            message.channel.send("Uploading script_chainer");
            client.channels.cache.get('824084821936308244').send(timestamp, { files: ["C:/Simba/Scripts/PremiumWaspBots/script_chainer.simba"] });

            message.channel.send("Uploading aio_agility");
            client.channels.cache.get('839214233589514240').send(timestamp, { files: ["C:/Simba/Scripts/PremiumWaspBots/aio_agility.simba"] });

            message.channel.send("Uploading aio_combiner");
            client.channels.cache.get('816264431952199740').send(timestamp, { files: ["C:/Simba/Scripts/PremiumWaspBots/aio_combiner.simba"] });


            message.channel.send("Uploading aio_fletcher");
            client.channels.cache.get('816596465337892905').send(timestamp, { files: ["C:/Simba/Scripts/PremiumWaspBots/aio_fletcher.simba"] });
            
            message.channel.send("Uploading aio_herblore");
            client.channels.cache.get('816593982611914762').send(timestamp, { files: ["C:/Simba/Scripts/PremiumWaspBots/aio_herblore.simba"] });

            message.channel.send("Uploading aio_pole_fisher");
            client.channels.cache.get('816640387073441802').send(timestamp, { files: ["C:/Simba/Scripts/PremiumWaspBots/aio_pole_fisher.simba"] });

            message.channel.send("Uploading aio_smither");
            client.channels.cache.get('816593682408013874').send(timestamp, { files: ["C:/Simba/Scripts/PremiumWaspBots/aio_smither.simba"] });
            
            
            message.channel.send("Uploading astral_runecrafter");
            client.channels.cache.get('849222080994344960').send(timestamp, { files: ["C:/Simba/Scripts/PremiumWaspBots/astral_runecrafter.simba"] });


            //message.channel.send("Uploading ");
            //client.channels.cache.get('').send(timestamp, { files: ["C:/Simba/Scripts/.simba"] });

        })
    },
    permissions: ['ADMINISTRATOR'],
    requiredRoles: ['Server Owner'],
}