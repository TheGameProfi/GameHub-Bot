const { PermissionsBitField, EmbedBuilder, ChannelType, ActionRowBuilder, SelectMenuBuilder, SlashCommandBuilder } = require('discord.js');
const groupSchema = require('../schema.js/groupSchema');
const serverSchema = require('../schema.js/serverSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Gruppen Übersicht')
        .addChannelOption(option => option.setName('channel').setDescription('Channel').setRequired(true)),

    async execute(interaction) {

        serverSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
            if(data){
                return interaction.reply({content: 'Nachricht wurde schon eingerichtet', ephemeral: true});
            }
            const db = await groupSchema.find({ Guild: interaction.guild.id });

            const userchannel = interaction.options.getChannel('channel');

            let channels = 0
            let voice = 0
            const group = db.map((val) => {
                channels = channels + parseInt(val.channels)
                let voicee = parseInt(val.voice)
                voice = voice + voicee
            })
            const channel = channels/db.length
            const voicee = voice/db.length

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Gruppen Übersicht')
                .setDescription(`Übersicht über die Gruppen von ${interaction.guild.name}`)
                .addFields({name: "Gruppen Anzahl", value: `${db.length}`})
                .addFields({name: 'Chats', value: ' '}, {name: 'Gesamt', value: `${channels}`, inline: true}, {name: 'Durchschnitt pro Gruppe', value: `⌀ ${channel}`, inline: true})
                .addFields({name: 'Voice-Chats', value: ' '}, {name: 'Gesamt', value: `${voice}`, inline: true}, {name: 'Durchschnitt pro Gruppe', value: `⌀ ${voicee}`, inline: true})
                .setFooter({ text: `${interaction.guild.name}`})
                .setTimestamp()
            const msg = await userchannel.send({embeds: [embed]});

            await serverSchema.create({
                Guild: interaction.guild.id,
                Channel: userchannel.id,
                Message: msg.id
            })

            interaction.reply({content: 'Nachricht wurde erfolgreich eingerichtet', ephemeral: true});
        })
    }
}