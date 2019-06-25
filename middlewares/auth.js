const express = require('express'),
	  session = require('express-session'),
	  axios = require('axios'),
	  router = express.Router();

function getUser(token) {
	let user;
	return axios('https://discordapp.com/api/users/@me', {
		method: 'GET',
		headers: {
	    	Authorization: `Bearer ${token}`,
	    },
	}).then(data => {
		user = {
			id: data.data.id,
			name: data.data.username + '#' + data.data.discriminator,
			avatar: data.data.avatar
		}
		return user;
	});
}

router.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}));

router.use((req, res, next) => {
	const session = req.session;
	if (session.token && !session.user) {
		getUser(session.token).then(user => {
			if (user)
				session.user = user;
			else
				delete session.token;
			next();
		}).catch(next);
	} else {
		next();
	}
});

module.exports = router;