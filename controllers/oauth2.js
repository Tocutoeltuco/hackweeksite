const express = require('express'),
	  btoa = require('btoa'),
	  axios = require('axios'),
	  router = express.Router();

const CLIENT_ID = process.env.CLIENT_ID,
	  creds = btoa(`${CLIENT_ID}:${process.env.CLIENT_SECRET}`),
	  redirect = encodeURIComponent('http://localhost:3000/discord/callback');

const forbiddenError = {
	title: '403 - Forbidden',
	statusCode: 403,
	description: "Sorry, you don't have access to the page you requested."
}

router.get('/login', (req, res) => {
	if (req.session.token)
		res.redirect('/');
	else 
		res.redirect(`https://discordapp.com/api/oauth2/authorize?client_id=${CLIENT_ID}&redirect_uri=${redirect}&response_type=code&scope=identify`);
});

router.get('/callback', (req, res, next) => {
	if (!req.query.code) return next(forbiddenError);
	const code = req.query.code;
	axios(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`, {
	    method: 'POST',
	    headers: {
	        Authorization: `Basic ${creds}`,
	    }
	}).then(data => {
		req.session.token = data.data.access_token;
		res.redirect('/');
	}).catch(next);
});

module.exports = router;