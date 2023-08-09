const { PermissionsBitField, EmbedBuilder, ButtonBuilder, ButtonStyle,  ActionRowBuilder, SlashCommandBuilder } = require('discord.js');
const ticketSchema = require('../schema.js/ticketSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket-create')
        .setDescription('Ticket System einstellen'),
    async execute(interaction) {
        if(!interaction.member.permissions.has("Administrator")) {
            return interaction.reply({content: 'Du hast keine Berechtigung diesen Command auszuführen', ephemeral: true});
        }

        ticketSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {

            if(!data){
                interaction.reply({content: 'Ticket System wurde noch nicht eingerichtet', ephemeral: true});
            }
            const channel = interaction.guild.channels.cache.find(c => c.id === data.TicketChannel);

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Antrag erstellen')
                .setDescription('Klicke auf den Knopf um ein Antrag zu erstellen')
                .setFooter({ text: `${interaction.guild.name} tickets`})

            const button = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('ticket-create')
                        .setLabel('Erstellen')
                        .setStyle(ButtonStyle.Success)
                )

            await channel.send({embeds: [embed], components: [button]});
            await interaction.reply({content: 'Ticket System wurde erfolgreich eingerichtet', ephemeral: true});
        })


    }
}