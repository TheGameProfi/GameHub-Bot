const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField, guild} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('copy')
        .setDescription('Kopiert eine Nachricht')
        .addStringOption(option => option.setName('nachricht').setDescription('Nachrricht id angeben').setRequired(true))
        .addChannelOption(option => option.setName('channel').setDescription('Channel auswählen').setRequired(true)),
    async execute(interaction, client) {
        if(!interaction.member.permissions.has(PermissionsBitField.ADMINISTRATOR)) {
            return await interaction.reply({content: 'Du hast keine Berechtigung diesen Command auszuführen', ephemeral: true});
        }

        const message = interaction.options.getString('nachricht');
        const channel = interaction.options.getChannel('channel');
        let content;
        await interaction.channel.messages.fetch(message)
            .then(message => {
                content = message.content;
            });

        const msg = new EmbedBuilder()
            .setDescription(content)

        await channel.send({embeds: [msg]})
        await interaction.reply({content: `Die Nachricht wurde nach "${channel}" kopiert`, ephemeral: true});

    }

}