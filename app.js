const express = require('express'),
	  hbs = require('express-handlebars'),
	  path = require('path'),
	  app = express();

const auth = require('./middlewares/auth'),
	  handleErr = require('./middlewares/error'),
	  oauth2 = require('./controllers/oauth2'),
	  dashboard = require('./controllers/dashboard');

app.engine('hbs', hbs({extname: '.hbs', helpers: {
	prop: (obj, key) => obj[key],
	in: (obj, key, type, id, op) => (obj[key][type].indexOf(id)!==-1),
	equals: (a, b, op) => a==b
}}));
app.set('view engine', 'hbs');

app.use(auth);
app.use(express.static('public'));
app.use('/discord', oauth2);
app.use('/dashboard', dashboard);

app.get('/', (req, res) => {
	res.render('home', { title: 'Chishiki: The Discord Bot', token: req.session.token, user: req.session.user });
});

app.use(handleErr);

app.listen(process.env.PORT || 3000, () => {
	console.log('listening on port');
});