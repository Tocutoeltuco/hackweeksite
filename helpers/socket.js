const net = require('net');

const bot = new net.Socket();

bot.connect(env.process.SOCKET_PORT, '127.0.0.1', () => {
	console.log('connected');
});