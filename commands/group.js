const { SlashCommandBuilder } = require('@discordjs/builders');
const { ChannelType, EmbedBuilder, PermissionFlagsBits, PermissionsBitField} = require('discord.js');
const groupSchema = require('../schema.js/groupSchema');
const serverSchema = require('../schema.js/serverSchema');


module.exports = {
    data: new SlashCommandBuilder()
        .setName('group')
        .setDescription('Group System')
        .addSubcommand(subcommand => subcommand.setName('info').setDescription('Informationen über diese Gruppe'))
        .addSubcommand(subcommand => subcommand.setName('help').setDescription('Liste aller Befehle'))
        .addSubcommandGroup(group => group.setName('admin').setDescription('Admin Commands')
            .addSubcommand(group => group.setName('make').setDescription('Gruppe erstellen')
                .addStringOption(option => option.setName('name').setDescription('Gruppen Name').setRequired(true))
                .addUserOption(option => option.setName('admin').setDescription('Gruppenleiter auswählen').setRequired(true))
                .addIntegerOption(option => option.setName('channel').setDescription('Channel Limit').setRequired(true))
                .addIntegerOption(option => option.setName('voice').setDescription('Voice Limit').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand.setName('delete').setDescription('Gruppe löschen')
                .addStringOption(option => option.setName('name').setDescription('Gruppen Name').setRequired(true))
                .addChannelOption(option => option.setName('category').setDescription('Kategorie').setRequired(true))
                .addUserOption(option => option.setName('admin').setDescription('Gruppenleiter auswählen').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand.setName('updatetext').setDescription('Text-Channel limit erhöhen')
                .addStringOption(option => option.setName('name').setDescription('Gruppen Name').setRequired(true))
                .addChannelOption(option => option.setName('category').setDescription('Kategorie').setRequired(true))
                .addUserOption(option => option.setName('admin').setDescription('Gruppenleiter auswählen').setRequired(true))
                .addIntegerOption(option => option.setName('channel').setDescription('Neues Channel Limit').setRequired(true))
            )
            .addSubcommand(subcommand => subcommand.setName('updatevoice').setDescription('Voice-Channel limit erhöhen')
                .addStringOption(option => option.setName('name').setDescription('Gruppen Name').setRequired(true))
                .addChannelOption(option => option.setName('category').setDescription('Kategorie').setRequired(true))
                .addUserOption(option => option.setName('admin').setDescription('Gruppenleiter auswählen').setRequired(true))
                .addIntegerOption(option => option.setName('channel').setDescription('Neues Channel Limit').setRequired(true))
            )
        )
        .addSubcommandGroup(group => group.setName('mod').setDescription('Modderatoren Commands')
            .addSubcommand(subcommand => subcommand.setName('add').setDescription('Modderator hinzufügen').addUserOption(option => option.setName('user').setDescription('User auswählen').setRequired(true)))
            .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Modderator entfernen').addUserOption(option => option.setName('user').setDescription('User auswählen').setRequired(true)))
        )
        .addSubcommandGroup(group => group.setName('create').setDescription('Commands zum Erstellen')
            .addSubcommand(subcommand => subcommand.setName('text').setDescription('Chat erstellen').addStringOption(option => option.setName('name').setDescription('Chat Name').setRequired(true)))
            .addSubcommand(subcommand => subcommand.setName('voice').setDescription('Voice-Chat erstellen').addStringOption(option => option.setName('name').setDescription('Voice-Chat Name').setRequired(true)))
        )
        .addSubcommandGroup(group => group.setName('delete').setDescription('Commands zum Löschen')
            .addSubcommand(subcommand => subcommand.setName('text').setDescription('Chat löschen').addChannelOption(option => option.setName('channel').setDescription('Chat auswählen').setRequired(true)))
            .addSubcommand(subcommand => subcommand.setName('voice').setDescription('Voice-Chat löschen').addChannelOption(option => option.setName('channel').setDescription('Voice-Chat auswählen').setRequired(true)))
        )
        .addSubcommand(subcommand => subcommand.setName('add').setDescription('Gruppen Übersicht bearbeiten')
            .addUserOption(option => option.setName('user').setDescription('User auswählen').setRequired(true))
        )
        .addSubcommand(subcommand => subcommand.setName('remove').setDescription('Gruppen Übersicht bearbeiten')
            .addUserOption(option => option.setName('user').setDescription('User auswählen'))
        ),

    async execute(interaction) {

        async function modify(data){
            const channel = await interaction.guild.channels.cache.get(data.Channel);
            const message = await channel.messages.fetch(data.Message);
            const db1 = await groupSchema.find({ Guild: interaction.guild.id });

            let channels = 0
            let voice = 0
            db1.map((val) => {
                channels = channels + parseInt(val.channels)
                let voicee = parseInt(val.voice)
                voice = voice + voicee
            })
            const channele = channels/db1.length
            const voicee = voice/db1.length

            const embed = new EmbedBuilder()
                .setColor('Blue')
                .setTitle('Gruppen Übersicht')
                .setDescription(`Übersicht über die Gruppen von ${interaction.guild.name}`)
                .addFields({name: "Gruppen Anzahl", value: `${db1.length}`})
                .addFields({name: 'Chats', value: ' '}, {name: 'Gesamt', value: `${channels}`, inline: true}, {name: 'Durchschnitt pro Gruppe', value: `⌀ ${channele}`, inline: true})
                .addFields({name: 'Voice-Chats', value: ' '}, {name: 'Gesamt', value: `${voice}`, inline: true}, {name: 'Durchschnitt pro Gruppe', value: `⌀ ${voicee}`, inline: true})
                .setFooter({ text: `${interaction.guild.name}`})
                .setTimestamp()
            await message.edit({ embeds: [embed] });
        }



        if(interaction.options.getSubcommandGroup() === 'admin') {
            switch (interaction.options.getSubcommand()) {
                case 'make': {
                    if(!interaction.member.permissions.has("Administrator"))
                        return interaction.reply({ content: 'Nur Server Administatoren dürfen den Befehl ausführen!', ephemeral: true });
                    const name = interaction.options.getString('name');
                    const admin = interaction.options.getUser('admin');
                    const channel = interaction.options.getInteger('channel').toString();
                    const voice = interaction.options.getInteger('voice').toString();
                    const guild = interaction.guild.id;

                    groupSchema.findOne({ Guild: guild, Group: name }, async (err, data) => {
                        if(!data){

                            await interaction.guild.channels.create({
                                name: name,
                                type: ChannelType.GuildCategory,
                                permissionOverwrites: [{
                                    id: interaction.guild.roles.everyone,
                                    deny: [PermissionFlagsBits.ViewChannel]
                                },
                                    {
                                        id: admin.id,
                                        allow: [PermissionFlagsBits.ViewChannel]
                                    }

                                ]
                            }).then(async category => {
                                await interaction.guild.channels.create({
                                    name: `text-${name}`,
                                    type: ChannelType.GuildText,
                                    parent: category
                                })

                                groupSchema.create({
                                    Guild: guild,
                                    Group: name,
                                    Admin: admin.id,
                                    Mod: [],
                                    GroupCategory: category.id,
                                    channelmax: channel,
                                    voice: 0,
                                    voicemax: voice,
                                    channels: 1,
                                })
                            })


                            serverSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
                                if(data){
                                    await modify(data)
                                }
                            })

                            return interaction.reply({content: `Gruppe: "${name}" wurde erstellt`, ephemeral: true});
                        }else{
                            return interaction.reply({content: `Gruppe: "${name}" existiert bereits`, ephemeral: true});
                        }
                    })
                    break
                }
                case 'delete': {
                    if(!interaction.member.permissions.has("Administrator"))
                        return interaction.reply({ content: 'Nur Server Administatoren dürfen den Befehl ausführen!', ephemeral: true });
                    const name = interaction.options.getString('name');
                    const guild = interaction.guild.id;
                    const category = await interaction.options.getChannel('category');
                    if(category.type !== ChannelType.GuildCategory)
                        return interaction.reply({content: 'Bitte gebe eine Kategorie an!', ephemeral: true});
                    const admin = interaction.options.getUser('admin');

                    const db = await groupSchema.findOneAndDelete({ Guild: guild, Group: name, Admin: admin.id, GroupCategory: category.id })
                    if(!db)
                        return interaction.reply({content: `Gruppe: "${name}" existiert nicht`, ephemeral: true});
                    else {

                        category.children.cache.forEach(async (channel) => {
                                await channel.delete();
                            }
                        )

                        await category.delete();
                        serverSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
                            if(data){
                                await modify(data)
                            }
                        })
                        return interaction.reply({content: `Gruppe: "${name}" wurde gelöscht`, ephemeral: true});
                    }
                }
                case 'updatetext': {
                    const name = interaction.options.getString('name');
                    const guild = interaction.guild.id;
                    const category = interaction.options.getChannel('category');
                    if(category.type !== ChannelType.GuildCategory)
                        return interaction.reply({content: 'Bitte gebe eine Kategorie an!', ephemeral: true});
                    const admin = interaction.options.getUser('admin');
                    const channel = interaction.options.getInteger('channel');

                    const dbe = await groupSchema.findOne({ Guild: guild, Group: name, Admin: admin.id, GroupCategory: category.id })
                    if(!dbe)
                        return interaction.reply({content: `Gruppe: "${name}" existiert nicht`, ephemeral: true});
                    else {
                        dbe.channelmax = channel
                        await dbe.save()
                        return interaction.reply({content: `Textkanal: "${name}" wurde auf ${channel} Channels eingestellt`, ephemeral: true});
                    }
                }
                case 'updatevoice': {
                    const name = interaction.options.getString('name');
                    const guild = interaction.guild.id;
                    const category = interaction.options.getChannel('category');
                    if(category.type !== ChannelType.GuildCategory)
                        return interaction.reply({content: 'Bitte gebe eine Kategorie an!', ephemeral: true});
                    const admin = interaction.options.getUser('admin');
                    const voice = interaction.options.getInteger('channel');

                    const dbe = await groupSchema.findOne({ Guild: guild, Group: name, Admin: admin.id, GroupCategory: category.id })
                    if(!dbe)
                        return interaction.reply({content: `Gruppe: "${name}" existiert nicht`, ephemeral: true});
                    else {
                        dbe.voicemax = voice
                        await dbe.save()
                        return interaction.reply({content: `Voic-Chats: "${name}" wurde auf ${voice} Voice-Chats eingestellt`, ephemeral: true});
                    }
                }
            }
            return
        }

        const categor = interaction.channel.parent
        if(!categor)
            return interaction.reply({ content: 'Dieser Channel gehört keiner oder einer Ungültige Kategorie an, Bitte wenden sie sich an einen Serveradmin!', ephemeral: true})
        const category = categor.id
        
        const interactionUser = interaction.user.id;

        const db = await groupSchema.findOne({ Guild: interaction.guild.id, GroupCategory: category })
        if(!db)
            return interaction.reply({ content: 'Dieser Channel ist keine Gruppe!', ephemeral: true })

        if(interaction.options.getSubcommand() === 'info') {
                const admin = await interaction.guild.members.cache.get(db.Admin).user
                const mod = []
                db.Mod.forEach(users => {
                    const user = interaction.guild.members.cache.get(users).user.tag
                    mod.push(user)
                })
                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('Gruppen Informationen')
                    .setDescription(`Die Gruppe "**${db.Group}**" hat folgende Informationen: `)
                    .addFields({ name: 'Gruppenleiter', value: admin.tag})
                    if(db.Mod.length > 0)
                        embed.addFields({name: 'Modderatoren', value: mod.join('\n')})
                    else embed.addFields({name: 'Modderatoren', value: 'Keine Modderatoren'})
                    .addFields({ name: 'Chats', value: `${db.channels.toString()}/${db.channelmax.toString()}`})
                    .addFields({ name: 'Voice-Chats', value: `${db.voice.toString()}/${db.voicemax.toString()}`})
                    .setTimestamp()
                    .setFooter({ text: `${interaction.guild.name}`})

                await interaction.reply({ embeds: [embed] });
            }else if(interaction.options.getSubcommand() === 'add'){
                if(db.Admin === interactionUser || db.Mod === interactionUser){
                    const user = interaction.options.getUser('user')
                    const channel = interaction.channel.parent.permissionOverwrites
                    await channel.edit(
                        user.id,
                        {
                            'ViewChannel': true,
                        })
                    interaction.reply({ content: 'Neues Mitglied hinzugefügt', ephemeral: true })
                    interaction.channel.send({ content: `<${user}> ist der Gruppe beigetreten!`})
                }else
                    return interaction.reply({ content: 'Du bist kein Modderator oder Admin dieser Gruppe!', ephemeral: true })
            }else if(interaction.options.getSubcommand() === 'remove'){
                let user = interaction.options.getUser('user')
                let self = false
                if(!user) {
                    user = interaction.user
                    self = true
                }
                const channel = interaction.channel.parent.permissionOverwrites
                await channel.edit(
                    user.id,
                    {
                        'ViewChannel': false,
                    }
                )
                if(!self)
                    interaction.reply({ content: 'Das Mitglied wurde entfernt', ephemeral: true })
                interaction.channel.send({ content: `<${user}> hat die Gruppe verlassen!`})

            }else if(interaction.options.getSubcommand() === 'help'){
                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('Gruppen Hilfe')
                    .setDescription('Hier sind alle Befehle für die Gruppen')
                    .addFields({ name: 'Gruppen Informationen', value: '`/group info`', inline: true},{ name: 'Gruppen Hilfe', value: '`/group help`', inline: true})
                    .addFields({ name: 'Gruppen Modderatoren', value:
                        '\nModderator hinzufügen: \n`/group mod add @user`\n'+
                        '\nModderator entfernen: \n`/group mod remove @user`'
                    })
                    .addFields({ name: 'Gruppen Chats', value:
                            '\nChat hinzufügen: \n`/group create <text/voice> <name>`\n'+
                            '\nChat entfernen: \n`/group delete <text/voice> #chat`'
                    })
                    .addFields({ name: 'Gruppenmitglied hinzufügen/entfernen', value:
                            '\nHinzufügen: \n`/group add @user` (Nur von Gruppen Admin und Mod)\n'+
                            '\nEntfernen: \n`/group remove @user`(Nur von Gruppen Admin und Mod)\n'+
                            '\nVerlassen: \n`/group remove`'
                    })
                    .addFields({ name: 'Gruppen Administration (Kann **NUR** vom **Server**-Administrator ausgeführt werden!)', value:
                            '\nGruppe Erstellen: \n`/group admin make <name> <gruppenLeiter> <channelLimit> <voiceLimit>`\n'+
                            '\nGruppe Löschen: \n`/group admin delete <name> <gruppenKategorie> <gruppenLeiter>`\n'+
                            '\nGruppe Chat-Limit ändern: \n`/group admin updatetext <name> <gruppenKategorie> <gruppenLeiter> <limit>`\n'+
                            '\nGruppe Voice-Limit ändern: \n`/group admin updatevoice <name> <gruppenKategorie> <gruppenLeiter> <limit>`'
                    })

                await interaction.reply({ embeds: [embed] });
            }else{

                switch (interaction.options.getSubcommandGroup()) {
                case 'mod': {
                    if (db.Admin === interactionUser) {
                        const user = interaction.options.getUser('user');
                        switch (interaction.options.getSubcommand()) {
                            case 'add': {
                                if(db.Mod !== user.id){
                                    await db.Mod.push(user.id);
                                    interaction.reply({content: `Modderator: "${user.username}" wurde hinzugefügt`, ephemeral: true});
                                }else {
                                    interaction.reply({
                                        content: `Mitglied: "${user.username}" ist bereits ein Modderator`,
                                        ephemeral: true
                                    })
                                }
                                break
                            }
                            case 'remove': {
                                if(db.Mod !== user.id) {
                                    await db.Mod.pull(user.id);
                                    interaction.reply({
                                        content: `Modderator: "${user.username}" wurde entfernt`,
                                        ephemeral: true
                                    });
                                }else {
                                    interaction.reply({
                                        content: `Mitglied: "${user.username}" ist kein Modderator`,
                                        ephemeral: true
                                    })
                                }
                                break
                            }
                        }
                        break
                    }else {
                        return interaction.reply({content: 'Nur der Gruppenleiter darf diesen Befehlt ausführen', ephemeral: true});
                    }
                }
                case 'create': {
                    if (db.Admin === interactionUser || db.Mod === interactionUser) {
                        switch (interaction.options.getSubcommand()) {
                            case 'text': {
                                if(db.channels !== db.channelmax){
                                    const channel = await interaction.guild.channels.create({
                                        name: interaction.options.getString('name'),
                                        type: ChannelType.GuildText,
                                        parent: category
                                    })
                                    await db.channels++

                                    serverSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
                                        if(data){
                                            await modify(data)
                                        }
                                    })

                                    interaction.reply({content: `Chat: ${channel} wurde erstellt`, ephemeral: true});


                                }else {
                                    interaction.reply({content: 'Du hast die maximale Anzahl an Chats erreicht, wende dich an ein Server-Administrator für weitere Infos', ephemeral: true});
                                }
                                break
                            }
                            case 'voice': {
                                if(db.voice !== db.voicemax){
                                    const channel = await interaction.guild.channels.create({
                                        name: interaction.options.getString('name'),
                                        type: ChannelType.GuildVoice,
                                        parent: category
                                    })
                                    await db.voice++
                                    serverSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
                                        if(data){
                                            await modify(data)
                                        }
                                    })
                                    interaction.reply({content: `Voice-Chat: ${channel} wurde erstellt`, ephemeral: true});
                                }else {
                                    interaction.reply({content: 'Du hast die maximale Anzahl an Voice-Chats erreicht, wende dich an ein Server-Administrator für weitere Infos', ephemeral: true});
                                }
                                break
                            }
                        }
                    }else {
                        interaction.reply({content: 'Nur der Gruppenleiter oder ein Modderator darf diesen Befehlt ausführen', ephemeral: true});
                    }
                    break
                }
                case 'delete': {
                    if(db.Admin === interactionUser) {
                        switch (interaction.options.getSubcommand()) {
                            case 'text': {
                                const channel = interaction.options.getChannel('channel');
                                if(channel.parent.id === category){
                                    if(db.channels !== 0){
                                        const channelname = channel.name;
                                        await channel.delete();

                                        serverSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
                                            if(data){
                                                await modify(data)
                                            }
                                        })
                                        await db.channels--
                                        interaction.reply({content: `Chat: ${channelname} wurde gelöscht`, ephemeral: true});
                                    }
                                    else interaction.reply({content: 'Ein Fehler ist aufgetreten verständigen sie ein Teammitglied (Error: group-146)', ephemeral: true})

                                }else {
                                    interaction.reply({content: 'Dieser Chat gehört nicht zu dieser Gruppe', ephemeral: true});
                                }
                                break
                            }
                            case 'voice': {
                                const channel = interaction.options.getChannel('channel');
                                if(channel.parent.id === category){
                                    if(db.voice !== 0){
                                        const channelname = channel.name;
                                        await channel.delete();

                                        serverSchema.findOne({ Guild: interaction.guild.id }, async (err, data) => {
                                            if(data){
                                                await modify(data)
                                            }
                                        })
                                        await db.voice--
                                        interaction.reply({content: `Voice-Chat: ${channelname} wurde gelöscht`, ephemeral: true});
                                    }
                                    else interaction.reply({content: 'Ein Fehler ist aufgetreten verständigen sie ein Teammitglied (Error: group-148)', ephemeral: true})
                                }else {
                                    interaction.reply({content: 'Dieser Voice-Chat gehört nicht zu dieser Gruppe', ephemeral: true});
                                }
                                break
                            }
                        }
                    }else {
                        interaction.reply({content: 'Nur der Gruppenleiter darf diesen Befehlt ausführen', ephemeral: true});
                    }
                    break
                }
            }
            await db.save();
        }

    }

}