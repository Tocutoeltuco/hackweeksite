const express = require('express'),
	  router = express.Router();

const notFoundErr = {
	title: '404 - Not Found',
	statusCode: 404,
	description: "Sorry, we couldn't find the page you were looking for."
}, 
internalErr = {
	title: '500 - Internal Server Error',
	statusCode: 500,
	description: 'Oops! Something went wrong.'
};

router.use((req, res, next) => {
	next(notFoundErr);
});

router.use((err, req, res, next) => {
	if (!err.statusCode) {
		console.log(err.message.substring(1,100));
		err = internalErr;
	}
	res.status(err.statusCode).render('error', err);
});

module.exports = router;