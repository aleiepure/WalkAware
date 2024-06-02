const express = require('express');
const jwt = require('jsonwebtoken');

const utenteWebModel = require('../models/utente_web.js');

require('dotenv').config();

const router = express.Router();

/**  
 * Web user registration
 * 
 * POST /api/v1/utente/web
 * 		Required fields: nome, email, password
 * 		Optional fields: supporto_tecnico
 * 
 * Response:
 * 		Headers: Location /api/v1/utente/web/{id}
*/
router.post('/', async (req, res) => {
	console.log(req.body);
	// Validate email field
	if (typeof req.body.email !== 'string' || !_isValidEmail(req.body.email)) {
		console.error("The 'email' field must be a non-empty string in email format.");
		return res.status(400).json({ success: false, error: "The 'email' field must be a non-empty string in email format." });
	}
	// Validate name field
	if (typeof req.body.nome !== 'string' || _isEmptyString(req.body.nome)) {
		console.error("The 'nome' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'nome' field must be a non-empty string." });
	}
	// Validate password field
	if (typeof req.body.password !== 'string' || _isEmptyString(req.body.password)) {
		console.error("The 'password' field must be a non-empty string");
		return res.status(400).json({ success: false, error: "The 'password' field must be a non-empty string." });
	}
	// Validate supporto_tecnico field
	if (req.body.supporto_tecnico && typeof req.body.supporto_tecnico !== 'boolean') {
		console.error("The optional 'supporto_tecnico' field must be a boolean");
		return res.status(400).json({ success: false, error: "The optional 'supporto_tecnico' field must be a boolean." });
	}

	// Check if user already exists
	utenteWebModel.findOne({ email: req.body.email })
		.then((existingUser) => {
			console.log(existingUser);
			if (existingUser) {
				console.error('A web user with the same email already exists.');
				return res.status(400).json({ success: false, error: 'A web user with the same email already exists.' });
			}

			//Create new user
			const user = new utenteWebModel({
				email: req.body.email,
				password: req.body.password,
				nome: req.body.nome,
				supporto_tecnico: req.body.supporto_tecnico || false,
			});
			user.save();

			// Response
			return res.location("/api/v1/utente/web/" + user._id).status(201).send({ success: true });
		})
		.catch((error) => {
			console.error(error.message);
			return res.status(500).json({ success: false, error: 'Internal server error.' });
		});
});

/**  
 * Web user login
 * 
 * POST /api/v1/utente/web/login
 * 		Required fields: email, password
*/
router.post('/login', async (req, res) => {

	// Validate email field
	if (typeof req.body.email !== 'string' || !_isValidEmail(req.body.email) || _isEmptyString(req.body.email)) {
		console.error("The 'email' field must be a non-empty string in email format.");
		return res.status(400).json({ success: false, error: "The 'email' field must be a non-empty string in email format." });
	}
	// Validate password field
	if (typeof req.body.password !== 'string' || _isEmptyString(req.body.password)) {
		console.error("The 'password' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'password' field must be a non-empty string." });
	}

	// User not found
	utenteWebModel.findOne({ email: req.body.email })
		.then((user) => {
			if (!user) {
				console.error('Authentication failed. User not found.');
				return res.status(401).json({ success: false, error: 'Authentication failed. User not found.' });
			}

			// Check password
			if (req.body.password != user.password) {
				return res.status(401).json({ success: false, error: 'Authentication failed. Incorrect password.' });
			}

			// Create JWT token
			const payload = { userId: user._id, email: user.email };
			const options = { expiresIn: '1y' };
			const secret = process.env.SUPER_SECRET || "supersecret";
			const token = jwt.sign(payload, secret, options);

			// Response
			return res.json({
				success: true,
				message: 'Authentication successful.',
				token: token,
				self: `/api/v1/utente/web/${user._id}`,
				email: user.email,
				userId: user._id,
				nome: user.nome,
				supporto_tecnico: user.supporto_tecnico
			});
		})
		.catch((error) => {
			console.error(error.message);
			return res.status(500).json({ success: false, error: 'Internal server error.' });
		});
});

/**
 * Get web
 * 
 * GET /api/v1/utente/web/{id}
 */
router.get('/:id', async (req, res) => {
	// User not found
	utenteWebModel.findById(req.params.id)
		.then((result) => {
			return res.send({ success: true, id: result.id, email: result.email, nome: result.nome, supporto_tecnico: result.supporto_tecnico});
		})
		.catch((error) => {
			console.error('User not found with the specified ID.');
			return res.status(404).json({ success: false, error: 'User not found with the specified ID.' });
		});
});

/**
 * mofica web
 * 
 * PUT /api/v1/utente/web/{id}
 */

router.put('/:id', async (req, res) =>{
	// Validate fields
	if (typeof req.body.email !== 'string' || !_isValidEmail(req.body.email) || _isEmptyString(req.body.email)) {
		console.error("The 'email' field must be a non-empty string in email format.");
		return res.status(400).json({ success: false, error: "The 'email' field must be a non-empty string in email format." });
	}
	if (typeof req.body.nome !== 'string' || _isEmptyString(req.body.nome)) {
		console.error("The 'nome' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'nome' field must be a non-empty string." });
	}

	utenteWebModel.findById(req.params.id)
		.then((result) => {

			// Update utente web
			result.email = req.body.email;
			result.nome = req.body.nome;
			if (req.body.password){
				if(req.body.old_password !== result.password){
					console.error('Incorrect old password');
					return res.status(400).json({ success: false, error: 'Incorrect old password' });
				} else if (req.body.password !== req.body.password_again){
					console.error('The two passwords do not match');
					return res.status(400).json({ success: false,  error: 'The two passwords do not match' });
				} else {
					result.password = req.body.password
				}
			}
			result.save();
			return res.status(200).send({ success: true });
		})
		.catch((error) => {
			console.error('Utente web not found');
			return res.status(404).json({ success: false, error: 'Utente web not found' });
		});
})


// Function to check email format
function _isValidEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function _isEmptyString(str) {
	return str.length === 0;
}

module.exports = router;
