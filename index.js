require("dotenv").config();

const fetchAll = require('discord-fetch-all');
const fs = require('fs');
const path = require('path');
const {SlashCommandBuilder} = require("@discordjs/builders");
const { DISCORD_TOKEN } = process.env;

const { startExporter } = require('./prometheus_exporter');

const { Client, GuildMember, GatewayIntentBits, Collection, ModalBuilder, TextInputBuilder, ActionRowBuilder, Events, TextInputStyle, EmbedBuilder, ButtonBuilder, ButtonStyle, ChannelType,
    SelectMenuBuilder,
    PermissionsBitField
} = require(`discord.js`);

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessageReactions,
    ],
});

startExporter();

const eventsPath = path.join(__dirname, `events`);
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith(`.js`));

let ticket = true;

eventFiles.forEach(eventFile => {
    const event = require(`./events/${eventFile}`)
    client.on(event.name, (...args) => event.execute(...args));
})

//load commands
client.commands = new Collection();
const commandPath = path.join(__dirname, `commands`);
const commandFiles = fs.readdirSync(commandPath).filter(file => file.endsWith(`.js`));
for (const file of commandFiles) {
    const filePath = path.join(commandPath, file);
    const command = require(filePath);
    if("data" in command && "execute" in command) {
        client.commands.set(command.data.name, command);
    } else{
    }
}

client.login(DISCORD_TOKEN) ;

const ticketSchema = require('./schema.js/ticketSchema');

client.on(Events.InteractionCreate, async (interaction) => {
    if(interaction.isButton()){
    if(interaction.customId === 'ticket-create') {

        ticketSchema.findOne({Guild: interaction.guild.id}, async (err, data) => {
            if (err || !data)
                interaction.reply({content: 'Fehler', ephemeral: true});

            if (!data.On) {
                interaction.reply({content: 'Das System ist deaktiviert', ephemeral: true});
                return;
            }


            const modal = new ModalBuilder()
                .setTitle('Weitere Informationen')
                .setCustomId('modal')

            const groupname = new TextInputBuilder()
                .setCustomId('groupname')
                .setRequired(true)
                .setPlaceholder('Gruppenname')
                .setLabel('Gebe den Gruppennamen an')
                .setStyle(TextInputStyle.Short)
            const membercount = new TextInputBuilder()
                .setCustomId('membercount')
                .setRequired(true)
                .setPlaceholder('Mitgliederanzahl')
                .setLabel('Gebe die ungefähre Mitgliederanzahl an')
                .setStyle(TextInputStyle.Short)
                .setMinLength(1)
                .setMaxLength(3)
            const leader = new TextInputBuilder()
                .setCustomId('leader')
                .setRequired(true)
                .setPlaceholder('User#0000')
                .setLabel('Gebe den Gruppenleiter an')
                .setStyle(TextInputStyle.Short)
                .setMinLength(6)

            const firstRow = new ActionRowBuilder().addComponents(groupname)
            const secondRow = new ActionRowBuilder().addComponents(membercount)
            const thirdRow = new ActionRowBuilder().addComponents(leader)

            modal.addComponents(firstRow, secondRow, thirdRow)

            let choices;
            if (interaction.isStringSelectMenu()) {
                choices = interaction.values;

                const result = choices.join('');

            }
            if (!interaction.isModalSubmit()) {
                interaction.showModal(modal);
            }
        })
    }

    }
})

client.on(Events.InteractionCreate, async (interaction) => {
    if(!interaction.isModalSubmit()) return;

    if(interaction.isModalSubmit()){
        if(interaction.customId === 'modal'){
            ticketSchema.findOne({Guild: interaction.guild.id}, async (err, data) => {
                if(err || !data)
                    interaction.reply({content: 'Fehler', ephemeral: true});

                if(!data.on){
                    return interaction.reply({content: 'System ist deaktiviert', ephemeral: true});
                }

                const groupname = interaction.fields.getTextInputValue('groupname');
                const membercount = interaction.fields.getTextInputValue('membercount');
                const leader = interaction.fields.getTextInputValue('leader');

                const category = data.TicketCategory;

                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle(`${groupname}'s - Antrag`)
                    .setDescription(`Hallo ${interaction.user.username},\n\n **Das Team wurde verständigt!** \n\n Bitte warte bis das Team deinen Antrag überprüft hat.`)
                    .addFields({ name: 'Gruppenname', value: groupname})
                    .addFields({ name: 'Mitgliederanzahl', value: membercount})
                    .addFields({ name: 'Gruppenleiter', value: leader})
                    .setFooter({ text: `${interaction.guild.name} Anträge`})

                const button = new ActionRowBuilder()
                    .addComponents(
                        new ButtonBuilder()
                            .setCustomId('ticket-delete')
                            .setLabel('Antrag löschen')
                            .setStyle(ButtonStyle.Danger)
                    )

                let channel = await interaction.guild.channels.create({
                    name: `antrag-${groupname}`,
                    type: ChannelType.GuildText,
                    parent: category
                })

                let msg = await channel.send({ embeds: [embed], components: [button]});
                await interaction.reply({ content: `Antrag wurde erstellt (${channel})`, ephemeral: true});

                const collector = msg.createMessageComponentCollector();
            })
        }
    }
})
client.on(Events.InteractionCreate, async (interaction) => {
    if(interaction.isButton()){
        if(interaction.customId === 'ticket-delete'){

            const channel = interaction.channel;

            const allMessages = await fetchAll.messages( channel, {
                reverseArray: true,
                userOnly: true,
                botOnly: false,
                pinnedOnly: false,
            });
            const data = []

            for(let i in allMessages) {
                let message = allMessages[i]
                data.push({
                    author_id : message.author.id,
                    author_name : `${message.author.username}#${message.author.discriminator}`,
                    content : message.content,
                    timestamp : message.createdAt
                })
            }


            let filename = 1;

            function write () {
                const fileexists = fs.existsSync(path.resolve('./json', `antrag-${channel.name+filename}.json`))
                const file = path.resolve('./json', `antrag-${channel.name+filename}.json`)
                if (fileexists) {
                    filename++
                    write()
                } else {
                    fs.writeFileSync(file, JSON.stringify(data))
                    interaction.reply({content: `Transcript saved as antrag-${channel.name+filename}.json`, ephemeral: true})
                }
            }
            write()

            await interaction.channel.delete();

            const adminchannel = interaction.guild.channels.cache.find(c => c.id === "1096080371403202652");

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('Antrag gelöscht')
                .setDescription(`Der Antrag von "${channel.name}" wurde durch "${interaction.user.username}" gelöscht.`)
                //.setFields({ name: 'Log', value: `https://www.next.callforcommunity.de/transcript/antrag-${channel.name+filename}`})
                .setTimestamp()
                .setFooter({ text: `${interaction.guild.name} Anträge`})

            await adminchannel.send({ embeds: [embed], files: [`./json/antrag-${channel.name+filename}.json`] });
        }
    }
})
