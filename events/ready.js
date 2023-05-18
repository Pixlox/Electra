const colours = require('colors');
const { Events, ActivityType } = require('discord.js');

module.exports = {
	name: Events.ClientReady,
	once: true,
	execute(client) {
		console.log(colours.green('[Electra] ') + `Logged in as ${client.user.tag}`);
		console.log(colours.green('[Electra] ') + `Bot ID: ${client.user.id}`);
		client.user.setActivity(`${require('../config.json').status} | version: alpha ${require('../package.json').version}`, {
			type: ActivityType.Playing,
		});  
	},
};
