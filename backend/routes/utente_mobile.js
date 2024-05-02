// Import required modules
const express = require('express');
const jwt = require('jsonwebtoken');
const utenteMobile = require('../db_models/utente_mobile.js');
require('dotenv').config();

// Create router
const router = express.Router();


// Route to create a new mobile user
router.post('', async (req, res) => {

	// Validate email format
	if (!isValidEmail(req.body.email)) {
		console.error('The "email" field must be a non-empty string in email format');
		return res.status(400).json({ error: 'The "email" field must be a non-empty string in email format' });
	}
	// Validate name field
	if (typeof req.body.nome != 'string') {
		console.error('The "nome" field must be a non-empty string');
		return res.status(400).json({ error: 'The "nome" field must be a non-empty string' });
	}
	// Validate eta field
	if (typeof req.body.eta != 'number' && req.body.eta > 18) {
		console.error('The "eta" field must be a number greater than 18');
		return res.status(400).json({ error: 'The "eta" field must be a number greater than 18' });
	}
	// Validate password field
	if (typeof req.body.password != 'string') {
		console.error('The "password" field must be a non-empty string');
		return res.status(400).json({ error: 'The "password" field must be a non-empty string' });
	}

	// Check if user already exists
	const existingUser = await utenteMobile.findOne({ email: req.body.email });
	if (existingUser) {
		console.error('A mobile user with the same email already exists.');
		return res.status(400).json({ error: 'A mobile user with the same email already exists.' });
	}

	// Create new user
	const newUser = new utenteMobile({
		email: req.body.email,
		password: req.body.password,
		nome: req.body.nome,
		eta: req.body.eta
	});
	await newUser.save();

	// Response
	return res.location("/api/v1/utente/mobile/" + newUser._id).status(201).send();
});

// Route for user login
router.post('/login', async (req, res) => {

	// Validate email format
	if (!isValidEmail(req.body.email)) {
		console.error('The "email" field must be a non-empty string in email format');
		return res.status(400).json({ success: false, error: 'The "email" field must be a non-empty string in email format' });
	}

	// Validate password field
	if (typeof req.body.password != 'string') {
		console.error('The "password" field must be a non-empty string');
		return res.status(400).json({ success: false, error: 'The "password" field must be a non-empty string' });
	}

	// User not found
	const user = await utenteMobile.findOne({ email: req.body.email });
	if (!user) {
		console.error('Authentication failed. User not found.');
		return res.status(401).json({ success: false, error: 'Authentication failed. User not found.' });
	}

	// Check password
	if (req.body.password !== user.password) {
		console.error('Authentication failed. Incorrect password.');
		return res.status(401).json({ success: false, error: 'Authentication failed. Incorrect password.' });
	}

	// Create JWT token
	const payload = { userId: user._id, email: user.email, password: user.password};
	const options = { expiresIn: '1y' };
	const token = jwt.sign(payload, process.env.SUPER_SECRET, options);

	// Response
	return res.json({
		success: true,
		message: 'Authentication successful.',
		token: token,
		email: user.email,
		userId: user._id,
		name: user.nome
	});
});

// Function to check email format
function isValidEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

router.post('/:id/segnalazioni', async (req, res) => {
	let user = await utenteMobile.findById(req.params.id).exec();
	if (!user) {
		return res.status(404).json({ error: "User does not exist" });
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
