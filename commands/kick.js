const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField, guild} = require('discord.js');
const serverSchema = require('../schema.js/serverSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('kick')
        .setDescription('Kickt einen User')
        .addUserOption(option => option.setName('user').setDescription('User auswählen').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Grund angeben').setRequired(true)),
    async execute(interaction, client) {
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
            return await interaction.reply({content: 'Du hast keine Berechtigung diesen Command auszuführen', ephemeral: true});
        }

        const user = interaction.options.getUser('user');
        const kickMember = await interaction.guild.members.fetch(user.id).catch(err => {
            return interaction.reply({content: 'Ich konnte diesen User nicht finden', ephemeral: true});
        })
        const reason = interaction.options.getString('reason');

        let admin;
        serverSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
            admin = interaction.guild.channels.cache.find(channel => channel.id === data.Admin);
        })

        const embed = new EmbedBuilder()
            .setDescription(`Du wurdest von "${interaction.guild.name}" gekickt | Grund: ${reason} |`)

        const embed2 = new EmbedBuilder()
            .setDescription(`${user.tag} wurde von ${interaction.user.tag} gekickt | Grund: ${reason} |`)

        await user.send({embeds: [embed]}).catch(err => {
            return
        });
        await kickMember.kick(reason).catch(err => {
            interaction.reply({content: 'Ich konnte diesen User nicht kicken', ephemeral: true});
        });

        if(admin){
            await admin.send({embeds: [embed2]});
        }
        await interaction.reply({content: `Der User ${user.tag} wurde gekickt`, ephemeral: true});
    }

}