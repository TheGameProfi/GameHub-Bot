const { GuildMember } = require('discord.js');
const { Events } = require("discord.js");

module.exports = {
    name: Events.GuildMemberAdd,
    execute(member){
        console.log(` has joined the server!`);
        const channel = member.guild.channels.cache.get('489836570149650433').send(
            `Welcome to the server, ${member.toString()}`
        );
    }
}