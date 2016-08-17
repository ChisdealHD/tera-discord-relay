'use strict';

// config
const fs = require('fs');
const fn = process.argv[2];
if (fn == null) {
  console.error('please specify config file');
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(fn, 'utf8'));

// set up bot
const Discord = require('discord.js');
const bot = new Discord.Client;

bot.on('ready', () => {
  console.log('connected as %s (%s)', bot.user.username, bot.user.id);
  bot.setStatus('online', 'TERA');
});

bot.on('warn', (warn) => {
  console.warn(warn);
});

bot.on('disconnected', () => {
  console.log('disconnected');
  process.exit();
});

// set up ipc
const ipc = require('./lib/ipc');
ipc.init(config['socket-name']);

// set up app
const app = { bot: bot, ipc: ipc };

console.log('loading submodules...');
for (let name of ['gchat', 'entry']) {
  const submodule = require('./lib/' + name);
  app[submodule] = new submodule(app, config);
  console.log('- loaded %s', name);
}

// connect
console.log('connecting...');

if (config['token']) {
  bot.loginWithToken(config['token']);
} else {
  bot.login(config['email'], config['pass']);
}