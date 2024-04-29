const express = require('express');
require('dotenv').config();
const router = express.Router();
const UtenteMobile = require('../db_models/utente_mobile.js'); // get our mongoose model
const jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens


router.post('', async (req, res) => {

	utenteMobile = new UtenteMobile({
        email: req.body.email,
        password: req.body.password
    });

	
	const utenteEsistente = await UtenteMobile.findOne({ email: utenteMobile.email });
	if (utenteEsistente) {
		console.log('Esiste già un utente mobile con la stessa email.');
		res.status(400).json({ error: 'Esiste già un utente mobile con la stessa email.' });
    	return;
	}
    
    if (!utenteMobile.email || typeof utenteMobile.email != 'string' || !checkIfEmailInString(utenteMobile.email)) {
        res.status(400).json({ error: 'The field "email" must be a non-empty string, in email format' });
        return;
    }
	utenteMobile = await utenteMobile.save();
	
    res.location("/api/v1/utente/mobile/" + utenteMobile.id).status(201).send();
	
});


router.post('/login', async (req, res) => {

	// find the user
	let utenteMobile = await UtenteMobile.findOne({
		email: req.body.email
	}).exec();

	// user not found
	if (!utenteMobile) {
		res.json({ success: false, message: 'Authentication failed. User not found.' });
		return;
	}
	
	// check if password matches
	if (utenteMobile.password != req.body.password) {
		res.json({ success: false, message: 'Authentication failed. Wrong password.' });
	}
	
	// if user is found and password is right create a token
	var payload = {
		email: utenteMobile.email,
		id: utenteMobile._id
		// other data encrypted in the token	
	}
	var options = {
		expiresIn: 86400 // expires in 24 hours
	}
	var token = jwt.sign(payload, process.env.SUPER_SECRET, options);
	

	res.json({
		success: true,
		message: 'Enjoy your token!',
		token: token,
		email: utenteMobile.email,
		id: utenteMobile._id,
		self: "api/v1/utente/mobile/login" + utenteMobile._id
	});

});


function checkIfEmailInString(text) {
    // eslint-disable-next-line
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(text);
}






module.exports = router;