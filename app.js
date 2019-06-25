const express = require('express'),
	  hbs = require('express-handlebars'),
	  path = require('path'),
	  app = express();

const auth = require('./middlewares/auth'),
	  handleErr = require('./middlewares/error'),
	  oauth2 = require('./controllers/oauth2');

app.engine('hbs', hbs({extname: '.hbs'}));
app.set('view engine', 'hbs');

app.use(auth);
app.use(express.static('public'));
app.use('/discord', oauth2);

app.get('/', (req, res) => {
	res.render('home', { title: 'Chishiki: The Discord Bot', token: req.session.token, user: req.session.user });
});

app.use(handleErr);

app.listen(process.env.PORT || 3000, () => {
	console.log('listening on port');
});