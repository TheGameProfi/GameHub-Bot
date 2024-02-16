'use strict';

const express = require('express');
const server = express();
const Client = require('prom-client');
const register = Client.register;
const Counter = Client.Counter
require('dotenv').config();

const port = process.env.PORT || 3000;

const prefix = 'discordBot_';

// Create custom metrics

const errorCounter = new Counter({
		name: prefix + 'errors',
		help: 'Errors appeared in the Discord bot',
});

const warningCounter = new Counter({
	name: prefix + 'warnings',
	help: 'Warnings appeared in the Discord bot',
});

const connectedDiscord = new Client.Gauge({
	name: prefix + 'discord_connected',
	help: 'Connected to Discord',
});
const connectedMongo = new Client.Gauge({
	name: prefix + 'mongo_connected',
	help: 'Connected to MongoDB',
});

const interactionCounter = new Client.Counter({
	name: prefix + 'interactions',
	help: 'Interactions with the bot',
});

const commandCounter = new Client.Gauge({
	name: prefix + 'commands',
	help: 'Commands applied',
});

const guildCounter = new Client.Gauge({
	name: prefix + 'guilds',
	help: 'Guilds the bot is connected to',
});

const latencyGauge = new Client.Gauge({
	name: prefix + 'latency',
	help: 'Latency of the bot',
});

// Setup server to Prometheus scrapes:

const processStartTimeMetric = new Client.Gauge({
	name: 'process_start_time_seconds',
	help: 'Start time of the process in seconds since the Unix epoch',
  });
  
  // Set the metric value to the process start time
processStartTimeMetric.set(Date.now() / 1000);

server.get('/metrics', async (req, res) => {
	try {
		res.set('Content-Type', register.contentType);
		res.end(await register.metrics());
	} catch (ex) {
		res.status(500).end(ex);
	}
});

const startExporter = () => {
    return new Promise((resolve, reject) => {
        server.listen(port, '0.0.0.0', () => {
            console.log('Prometheus exporter listening on port ' + port);
            resolve();
        });
    });
}

module.exports = {
	startExporter,
	errorCounter,
	warningCounter,
	connectedDiscord,
	connectedMongo,
	interactionCounter,
	commandCounter,
	latencyGauge,
	guildCounter
};
