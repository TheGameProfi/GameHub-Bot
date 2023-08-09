const { PermissionsBitField, EmbedBuilder, ChannelType, ActionRowBuilder, SelectMenuBuilder, SlashCommandBuilder } = require('discord.js');
const ticketScheama = require('../schema.js/ticketSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-disable')
        .setDescription('Ticket System deaktivieren')
        .addBooleanOption(option => option.setName('disable').setDescription('Ticket System').setRequired(true)),

    async execute(interaction) {
        if(!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({content: 'Du hast keine Berechtigung diesen Command auszuführen', ephemeral: true});
        }
        const bool = interaction.options.getBoolean('disable');

        if(bool === false){
            ticketScheama.findOneAndUpdate({ Guild: interaction.guild.id }, { On: false })
            interaction.reply({content: 'Ticket System wurde deaktiviert', ephemeral: true});
        }else{
            ticketScheama.findOneAndUpdate({ Guild: interaction.guild.id }, { On: true })
            interaction.reply({content: 'Ticket System wurde aktiviert', ephemeral: true});
        }
    }
}