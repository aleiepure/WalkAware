// Import required modules
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const UtenteMobile = require('../db_models/utente_mobile.js');
require('dotenv').config();

// Create router
const router = express.Router();


// Route to create a new mobile user
router.post('', async (req, res) => {
	// Check if user already exists
	const existingUser = await UtenteMobile.findOne({ email: req.body.email });
	if (existingUser) {
		console.log('A mobile user with the same email already exists.');
		return res.status(400).json({ error: 'A mobile user with the same email already exists.' });
	}

	// Validate email format
	if (!isValidEmail(req.body.email)) {
		return res.status(400).json({ error: 'The "email" field must be a non-empty string in email format' });
	}

	// Hash password
	const salt = bcrypt.genSaltSync(10);
	const hashedPassword = bcrypt.hashSync(req.body.password, salt);

	// Create new user
	const newUser = new UtenteMobile({
		email: req.body.email,
		password: hashedPassword
	});
	await newUser.save();

	// Response
	return res.status(201).send();
	//return res.location("/api/v1/utente/mobile/" + newUser._id).status(201).send();
});

// Route for user login
router.post('/login', async (req, res) => {
	// Find user by email
	const user = await UtenteMobile.findOne({ email: req.body.email });

	// User not found
	if (!user) {
		return res.status(401).json({ error: 'Authentication failed. User not found.' });
	}

	// Check password
	if (!bcrypt.compareSync(req.body.password, user.password)) {
		return res.status(401).json({ error: 'Authentication failed. Incorrect password.' });
	}

	// Create JWT token
	const payload = { email: user.email, id: user._id };
	const options = { expiresIn: '1y' }; // 1 year in seconds
	const token = jwt.sign(payload, process.env.SUPER_SECRET, options);

	// Response
	return res.json({
		success: true,
		message: 'Enjoy your token!',
		token: token,
		email: user.email,
		id: user._id,
		self: `/api/v1/utente/mobile/login/${user._id}`
	});
});

// Function to check email format
function isValidEmail(email) {
    const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

router.post('/:id/segnalazioni', async(req, res)=>{
	let user = await UtenteMobile.findById(req.params.id).exec();
	if (!user){
		return res.status(404).json({error: "User does not exist"});
	}

	let newSegnalazione = {
    	luogo: req.body.luogo,
    	foto: req.body.foto,
    	tipo: req.body.tipo,
    	urgenza: req.body.urgenza,
    	status: req.body.status
	}

	user.segnalazioni.push(newSegnalazione);
	await user.save()

	return res.location("/api/v1/utente/mobile/" + user._id + "/segnalazioni/" + newSegnalazione._id).status(201).send();


});


module.exports = router;
