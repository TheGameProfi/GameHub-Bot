const { Events } = require(`discord.js`);
const mongoose = require(`mongoose`);
const mongodbURL = process.env.MONGODB_URL;


const { connectedMongo, connectedDiscord, commandCounter, guildCounter } = require('../prometheus_exporter');

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);
	connectedDiscord.set(1);

        guildCounter.set(client.guilds.cache.size);
        commandCounter.set(client.commands.size);

        if (!mongodbURL) return console.log(`No MongoDB URL provided`);

        await mongoose.set('strictQuery', false)

        await mongoose.connect(mongodbURL || '', {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        if(mongoose.connect){
            console.log(`Connected to MongoDB`);
        connectedMongo.set(1);
	}
    }
}
