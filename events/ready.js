const { Events } = require(`discord.js`);
const mongoose = require(`mongoose`);
const mongodbURL = process.env.MONGODB_URL;

module.exports = {
    name: Events.ClientReady,
    once: true,
    async execute(client) {
        console.log(`Ready! Logged in as ${client.user.tag}`);

        if (!mongodbURL) return console.log(`No MongoDB URL provided`);

        await mongoose.set('strictQuery', false)

        await mongoose.connect(mongodbURL || '', {
            keepAlive: true,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })

        if(mongoose.connect){
            console.log(`Connected to MongoDB`);
        }
    }
}