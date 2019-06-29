const net = require('net');

const bot = new net.Socket();

const queue = [],
	  separator = String.fromCharCode(1);

let buffer = '';

bot.connect(process.env.SOCKET_PORT, process.env.SOCKET_IP, () => {
	console.log('socket connected.');
});

bot.on('disconnect', reason => {
	console.log('disconnected', reason);
	bot.connect();
});

bot.on('data', data => {
	buffer += data;
	const packets = buffer.split(separator);
	buffer = packets.pop();
	for (const packet of packets) {
		console.log('recieved', packet);
		queue.shift()(JSON.parse(packet));
	}
});

exports.request = data => (
	new Promise((resolve, reject) => {
		queue.push(resolve);
		bot.write(JSON.stringify(data)+separator);
	})
);