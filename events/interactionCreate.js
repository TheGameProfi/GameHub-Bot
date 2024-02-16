const { Events } = require("discord.js");
const { interactionCounter, latencyGauge } = require('../prometheus_exporter');

module.exports = {
    name: Events.InteractionCreate,
    async execute(interaction) {
        if (!interaction.isChatInputCommand()) return;

        const command = interaction.client.commands.get(interaction.commandName);

        if (!command) {
            console.error(
                `No command matching ${interaction.commandName} was found.`
            );
            return;
        }

        try {
 	    interactionCounter.inc();
            const startTime = Date.now();
            await command.execute(interaction);
            const endTime = Date.now();
            const duration = endTime - startTime;
            latencyGauge.set(duration);
        } catch (error) {
            console.error(`Error executing ${interaction.commandName}`);
            console.error(error);
        }
    },
};
