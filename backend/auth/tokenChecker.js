const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens

const tokenChecker = function (req, res, next) {
	if (req.path === '/api/v1/utente/mobile' ||
		req.path === '/api/v1/utente/mobile/login' ||
		req.path === "/api/v1/utente/web/login") {
		return next();
	}
	// check header or url parameters or post parameters for token
	var token = req.body.token || req.query.token || req.headers['x-access-token'];

	// if there is no token
	if (!token) {
		return res.status(401).send({
			success: false,
			message: 'No token provided.'
		});
	}

	// decode token, verifies secret and checks exp
	const token_secret = process.env.SUPER_SECRET || "supersecret";
	jwt.verify(token, token_secret, function (err, decoded) {
		if (err) {
			return res.status(403).send({
				success: false,
				message: 'Failed to authenticate token.'
			});
		} else {
			// if everything is good, save to request for use in other routes
			req.loggedUser = decoded;
			next();
		}
	});

};

module.exports = tokenChecker