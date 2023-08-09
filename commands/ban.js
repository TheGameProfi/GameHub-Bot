const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');
const serverSchema = require('../schema.js/serverSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ban')
        .setDescription('Bannt einen User')
        .addUserOption(option => option.setName('user').setDescription('User auswählen').setRequired(true))
        .addStringOption(option => option.setName('reason').setDescription('Grund angeben').setRequired(true)),
    async execute(interaction, client) {
        if(!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return await interaction.reply({content: 'Du hast keine Berechtigung diesen Command auszuführen', ephemeral: true});
        }

        const user = interaction.options.getUser('user');
        const banMember = await interaction.guild.members.fetch(user.id).catch(err => {
            return interaction.reply({content: 'Ich konnte diesen User nicht finden', ephemeral: true});
        })
        const reason = interaction.options.getString('reason');

        let admin;
        serverSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
            admin = interaction.guild.channels.cache.find(channel => channel.id === data.Admin);
        })
        const embed = new EmbedBuilder()
            .setDescription(`Du wurdest von "${interaction.guild.name}" gebannt | Grund: ${reason} |`)

        const embed2 = new EmbedBuilder()
            .setColor('Blue')
            .setTitle(`Der Banhammer hat über ${user} geurteilt`)
            .setDescription(`Das Urteil wurde durch ${interaction.user} gefällt`)
            .setFooter({ text: `${interaction.guild.name} tickets`})
            .setTimestamp()

        await user.send({embeds: [embed]}).catch(err => {
            return
        });
        await banMember
            .ban({reason: reason})
            .catch(err => {
                interaction.reply({content: 'Ich konnte diesen User nicht bannen', ephemeral: true});
            });
        if(admin){
            await admin.send({embeds: [embed2]});
        }

        const dmEmbed = new EmbedBuilder()

        await interaction.reply({content: `Der User ${user.tag} wurde gebannt`, ephemeral: true});

    }

}