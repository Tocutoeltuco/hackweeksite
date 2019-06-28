const express = require('express'),
	  axios = require('axios'),
	  bodyParser = require('body-parser');
	  router = express.Router();

const Guild = require('../models/guild');

function hasPermissions(flag) {
	return ((flag & 8) == 8 || (flag & 32) == 32)
}

function getGuilds(token) {
	return axios('https://discordapp.com/api/users/@me/guilds', {
		method: 'GET',
		headers: {
	    	Authorization: `Bearer ${token}`,
	    },
	}).then(data => {
		const list = data.data.map(guild => guild.id);
		return [list, data.data];
	});
}

router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', (req, res, next) => {
	const session = req.session;
	if (!session.token)
		return res.redirect('/'); //unauthorized
	getGuilds(session.token).then(lists => {
		const [list, guilds] = lists;
		Guild.checkGuilds(session.user.id, list).then(filtered => {
			guilds.filter(guild => (filtered.indexOf(guild.id) !== -1));
			res.render('dashboard/servers', {title: 'Chishiki: Dashboard', user: session.user, servers: guilds});
		});
	}).catch(next);
});

router.get(/^\/(\d+)$/, (req, res, next) => {
	const guildId = req.params[0],
		  session = req.session;
	if (!session.token)
		return res.redirect('/'); //unauthorized
	Guild.checkGuilds(session.user.id, [guildId]).then(checked => {
		if (!checked.length) return next(); //unauthorized
		return Guild.findById(guildId);
	}).then(guild => {
		guild.id = guildId;
		res.render('dashboard/guild', {title: `Chishiki: ${guild.name}`, guild: guild, cogs: Guild.cogs});
	});
});

router.post('/save', (req, res, next) => {
	if (!req.session.token)
		return res.redirect('/'); //unauthorized
	Guild.save(req.body).then(message => {
		if (message.result == 'success')
			res.render('sucess');
		else
			next(message);
	}).catch(next);
});

module.exports = router;