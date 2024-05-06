const express = require('express');
const jwt = require('jsonwebtoken');

const utenteMobileModel = require('../models/utente_mobile.js');
const segnalazioneModel = require('../models/segnalazione.js');

require('dotenv').config();

const router = express.Router();

/**  
 * Mobile user registration
 * 
 * POST /api/v1/utente/mobile
 * 		Required fields: email, password, nome, eta
 * 
 * Response:
 * 		Headers: Location /api/v1/utente/mobile/{id}
*/
router.post('', async (req, res) => {

	// Validate email field
	if (typeof req.body.nome !== 'string' || !_isValidEmail(req.body.email)) {
		console.error("The 'email' field must be a non-empty string in email format.");
		return res.status(400).json({ success: false, error: "The 'email' field must be a non-empty string in email format." });
	}
	// Validate name field
	if (typeof req.body.nome !== 'string') {
		console.error("The 'nome' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'nome' field must be a non-empty string." });
	}
	// Validate eta field
	if (typeof req.body.eta !== 'number' || req.body.eta < 18) {
		console.error("The 'eta' field must be a number greater than 18.");
		return res.status(400).json({ success: false, error: "The 'eta' field must be a number greater than 18." });
	}
	// Validate password field
	if (typeof req.body.password !== 'string') {
		console.error('The "password" field must be a non-empty string');
		return res.status(400).json({ success: false, error: 'The "password" field must be a non-empty string.' });
	}

	// Check if user already exists
	const existingUser = await utenteMobileModel.utenteMobileModel.findOne({ email: req.body.email });
	if (existingUser) {
		console.error('A mobile user with the same email already exists.');
		return res.status(400).json({ success: false, error: 'A mobile user with the same email already exists.' });
	}

	// Create new user
	const user = new utenteMobileModel({
		email: req.body.email,
		password: req.body.password,
		nome: req.body.nome,
		eta: req.body.eta
	});
	await user.save();

	// Response
	return res.status(201).location("/api/v1/utente/mobile/" + user._id).send({ success: true });
});

/**  
 * Mobile user login
 * 
 * POST /api/v1/utente/mobile/login
 * 		Required fields: email, password
*/
router.post('/login', async (req, res) => {

	// Validate email field
	if (typeof req.body.email !== 'string' || !_isValidEmail(req.body.email)) {
		console.error("The 'email' field must be a non-empty string in email format.");
		return res.status(400).json({ success: false, error: "The 'email' field must be a non-empty string in email format." });
	}
	// Validate password field
	if (typeof req.body.password !== 'string') {
		console.error("The 'password' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'password' field must be a non-empty string." });
	}

	// User not found
	const user = await utenteMobileModel.utenteMobileModel.findOne({ email: req.body.email });
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
	const payload = { userId: user._id, email: user.email };
	const options = { expiresIn: '1y' };
	const token = jwt.sign(payload, process.env.SUPER_SECRET, options);

	// Response
	return res.json({
		success: true,
		message: 'Authentication successful.',
		token: token,
		self: `/api/v1/utente/mobile/${user._id}`,
		email: user.email,
		userId: user._id,
		name: user.nome,
		points: user.punti
	});
});

/**  
 * Add new segnalazione
 * 
 * POST /api/v1/utente/mobile/{id}/segnalazioni
 * 		Required fields: luogo, urlFoto, tipo, urgenza, status
 * 
 * Response: 201 Created
 * 		Headers: Location /api/v1/utente/mobile/{id}/segnalazioni/{id}
*/
router.post('/:id/segnalazioni', async (req, res) => {

	// Validate luogo field
	// TODO: add regex for lat, long
	if (typeof req.body.luogo !== 'string' || req.body.luogo.length === '') {
		console.error("The 'luogo' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'luogo' field must be a non-empty string." });
	}
	// Validate foto field
	if (typeof req.body.urlFoto !== 'string' || req.body.urlFoto === '') {
		console.error("The 'urlFoto' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'urlFoto' field must be a non-empty string." });
	}
	// Validate tipo field
	if (typeof req.body.tipo !== 'string' || !['strada', 'illuminazione', 'segnaletica', 'sicurezza', 'barriereArchitettoniche'].includes(req.body.tipo)) {
		console.error("The 'tipo' field must be a either 'strada', 'illuminazione', 'segnaletica', 'sicurezza' or 'barriereArchitettoniche'.");
		return res.status(400).json({ success: false, error: "The 'tipo' field must be a either 'strada', 'illuminazione', 'segnaletica', 'sicurezza' or 'barriereArchitettoniche'." });
	}
	// Validate urgenza field
	if (typeof req.body.urgenza !== 'string' || !['bassa', 'medio-bassa', 'medio-alta', 'alta'].includes(req.body.urgenza)) {
		console.error("The 'urgenza' field must be either 'bassa', 'medio-bassa', 'medio-alta' or 'alta'.");
		return res.status(400).json({ success: false, error: "The 'urgenza' field must be either 'bassa', 'medio-bassa', 'medio-alta' or 'alta'." });
	}
	// Validate status field
	if (typeof req.body.status !== 'string' || !['aperta', 'presa_in_carico', 'conclusa'].includes(req.body.status)) {
		console.error('The "status" field must be either "aperta", "presa_in_carico" or "conclusa".');
		return res.status(400).json({ success: false, error: "The 'status' field must be either 'aperta', 'presa_in_carico' or 'conclusa'." });
	}

	// Check if user exists
	utenteMobileModel.utenteMobileModel.findById(req.params.id).exec()
		.then((result) => {
			// Create new segnalazione inside user
			let segnalazioneUtenteMobile = new utenteMobileModel.segnalazioneUtenteMobileModel({
				luogo: req.body.luogo,
				urlFoto: req.body.urlFoto,
				tipo: req.body.tipo,
				urgenza: req.body.urgenza,
				status: req.body.status
			});
			result.segnalazioni.push(segnalazioneUtenteMobile);
			result.save();

			// Create new segnalazione
			let segnalazione = new segnalazioneModel({
				id: segnalazioneUtenteMobile._id,
				luogo: req.body.luogo,
				urlFoto: req.body.urlFoto,
				tipo: req.body.tipo,
				urgenza: req.body.urgenza,
				status: req.body.status
			});
			segnalazione.save();

			// Response
			return res.location("/api/v1/utente/mobile/" + result._id + "/segnalazioni/" + segnalazioneUtenteMobile._id).status(201).send({ success: true });
		})
		.catch((error) => {
			console.error('User not found with the specified ID.');
			return res.status(404).json({ success: false, error: 'User not found with the specified ID.' });
		});
});

/**  
 * Get all user's segnalazione
 * 
 * GET /api/v1/utente/mobile/{id}/segnalazioni
 * 
*/
router.get("/:id/segnalazioni/", async (req, res) => {

	// Check if user exists
	utenteMobileModel.utenteMobileModel.findById(req.params.id).exec()
		.then((result) => {
			return res.status(200).json({ success: true, segnalazioni: result.segnalazioni });
		})
		.catch((error) => {
			console.error('User not found with the specified ID.');
			return res.status(404).json({ success: false, error: 'User not found with the specified ID.' });
		});
});

/**
 * Update mobile user's points
 * 
 * PUT /api/v1/utente/mobile/{id}/punti
 * 		Required fields: punti
 */
router.put('/:id/punti', async (req, res) => {

	// Validate punti field
	if (typeof req.body.punti != 'number') {
		console.error("The 'punti' field must be a number");
		return res.status(400).json({ success: false, error: "The 'punti' field must be a number" });
	}

	// User not found
	utenteMobileModel.utenteMobileModel.findById(req.params.id)
		.then((result) => {
			result.punti = req.body.punti;
			result.save();

			return res.send({ success: true, punti: result.punti });
		})
		.catch((error) => {
			console.error('User not found with the specified ID.');
			return res.status(404).json({ success: false, error: 'User not found with the specified ID.' });
		});
});

/**
 * Get mobile user's points
 * 
 * GET /api/v1/utente/mobile/{id}/punti
 */
router.get('/:id/punti', async (req, res) => {
	// User not found
	utenteMobileModel.utenteMobileModel.findById(req.params.id)
	.then((result) => {
		return res.send({ success: true, punti: result.punti });
	})
	.catch((error) => {
		console.error('User not found with the specified ID.');
		return res.status(404).json({ success: false, error: 'User not found with the specified ID.' });
	});
});

// Check if a given email is in a valid format
function _isValidEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

module.exports = router;
