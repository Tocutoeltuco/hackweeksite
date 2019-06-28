const express = require('express'),
	  cookieParser = require('cookie-parser'),
	  session = require('express-session'),
	  axios = require('axios'),
	  router = express.Router();

function getUser(token) {
	return axios('https://discordapp.com/api/users/@me', {
		method: 'GET',
		headers: {
	    	Authorization: `Bearer ${token}`,
	    },
	}).then(data => {
		return {
			id: data.data.id,
			name: data.data.username + '#' + data.data.discriminator,
			avatar: data.data.avatar
		}
	});
}

router.use(cookieParser());
router.use(session({secret: process.env.SESSION_SECRET, resave: false, saveUninitialized: false}));

router.use((req, res, next) => {
	const session = req.session;
	if (!req.cookies.cache) {
		delete session.user;
	}
	res.cookie('cache', '1', { maxAge: 7200000, httpOnly: true })
	if ((new Date()) >= (new Date(session.date))) {
		delete session.token;
		delete session.user;
	}
	if (session.token && !session.user) {
		getUser(session.token).then(user => {
			session.user = user;
			next();
		}).catch(err => {
			if (err.message == '401: Unauthorized') {
				delete session.token;
				delete session.user;
				next();
			} else {
				next(err);
			}
		});
	} else {
		next();
	}
});

module.exports = router;