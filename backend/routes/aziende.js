const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const aziendaModel = require('../models/azienda');
const premioModel = require('../models/premio');

/**  
 * Register a new azienda
 * 
 * POST /api/v1/aziende
 * 		Required fields: email, nome, p_iva, password
 * 		Response: 201 Created
 * 			Headers: Location: /api/v1/aziende/{id}
*/
router.post("/", (req, res) => {
	// Validate email field
	if (typeof req.body.email !== 'string' || !_isValidEmail(req.body.email) || _isEmptyString(req.body)) {
		console.error("The 'email' field must be a non-empty string in email format.");
		return res.status(400).json({ success: false, error: "The 'email' field must be a non-empty string in email format." });
	}
	// Validate name field
	if (typeof req.body.nome !== 'string' || _isEmptyString(req.body.nome)) {
		console.error("The 'nome' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'nome' field must be a non-empty string." });
	}
	// Validate p_iva field
	if (typeof req.body.p_iva !== 'string' || _isEmptyString(req.body.p_iva)) {
		console.error("The 'p_iva' field must be a string.");
		return res.status(400).json({ success: false, error: "The 'p_iva' field must be a string." });
	}
	// Validate password field
	if (typeof req.body.password !== 'string' || _isEmptyString(req.body.password)) {
		console.error('The "password" field must be a non-empty string');
		return res.status(400).json({ success: false, error: 'The "password" field must be a non-empty string.' });
	}

	// Azienda already exists
	aziendaModel.findOne({ email: req.body.email })
		.then((result) => {
			if (result !== null) {
				console.error('An azienda with the same email already exists.');
				return res.status(400).json({ success: false, error: 'An azienda with the same email already exists.' });
			}

			// Create new Azienda
			const azienda = new aziendaModel({
				email: req.body.email,
				password: req.body.password,
				nome: req.body.nome,
				p_iva: req.body.p_iva
			});
			azienda.save();

			// Response 
			return res.status(201).location("/api/v1/aziende" + azienda._id).send({ success: true });
		})
		.catch((error) => {
			console.error("Problem retrieving aziende");
			return res.status(500).json({ success: false, error: "Problem retrieving aziende" });
		});
});


/**  
 * Azienda user login
 * 
 * POST /api/v1/utente/aziende/login
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
	aziendaModel.findOne({ email: req.body.email })
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
				self: `/api/v1/aziende/${user._id}`,
				email: user.email,
				userId: user._id,
				name: user.nome
			});
		})
		.catch((error) => {
			console.error(error.message);
			return res.status(500).json({ success: false, error: 'Internal server error.' });
		});
});


/**  
 * Get all aziende
 * 
 * GET /api/v1/aziende
*/
router.get("/", async (req, res) => {
	aziendaModel.find().then((aziende) => {
		return res.json({ success: true, aziende: aziende });
	}).catch((error) => {
		console.error("Problem retrieving aziende");
		return res.status(500).json({ success: false, error: "Problem retrieving aziende" });
	});
});

/**  
 * Get azienda with id
 * 
 * GET /api/v1/aziende/{id}
*/
router.get("/:id", async (req, res) => {
	aziendaModel.findById(req.params.id).then((azienda) => {
		return res.json({ success: true, azienda: azienda });
	}).catch((error) => {
		console.error("Azienda not found");
		return res.status(404).json({ success: false, error: "Azienda not found" });
	});
});


/**  
 * Add premio to azienda
 * 
 * POST /api/v1/aziende/{id}/premi
 * 		Required fields: nome, valore, tipo, descrizione, costo_punti, idAzienda, validitaBuono
*/
router.post("/:id/premi", async (req, res) => {
	// Validate fields
	if (typeof req.body.nome !== 'string' || _isEmptyString(req.body.nome)) {
		console.error("The 'nome' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'nome' field must be a non-empty string." });
	}
	if (typeof req.body.valore !== 'number' || req.body.valore < 0) {
		console.error("The 'valore' field must be a positive number.");
		return res.status(400).json({ success: false, error: "The 'valore' field must be a positive number." });
	}
	if (typeof req.body.tipo !== 'string' || !["percentuale", "contante", "omaggio", "quantita"].includes(req.body.tipo)) {
		console.error("The 'tipo' field must be either 'percentuale', 'contante', 'omaggio' or 'quantita'.");
		return res.status(400).json({ success: false, error: "The 'tipo' field must be either 'percentuale', 'contante', 'omaggio' or 'quantita'." });
	}
	if (typeof req.body.descrizione !== 'string' || _isEmptyString(req.body.descrizione)) {
		console.error("The 'descrizione' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'descrizione' field must be a non-empty string." });
	}
	if (typeof req.body.costo_punti !== 'number' || req.body.costo_punti < 0) {
		console.error("The 'costo_punti' field must be a positive number.");
		return res.status(400).json({ success: false, error: "The 'costo_punti' field must be a positive number." });
	}
	if (typeof req.body.idAzienda !== 'string' || _isEmptyString(req.body.idAzienda)) {
		console.error("The 'idAzienda' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'idAzienda' field must be a non-empty string." });
	}
	if (typeof req.body.validitaBuono !== 'number' || req.body.validitaBuono < 0) {
		console.error("The 'validitaBuono' field must be a positive number.");
		return res.status(400).json({ success: false, error: "The 'validitaBuono' field must be a positive number." });
	}

	aziendaModel.findById(req.params.id)
		.then(async (result) => {
			let newPremio = new premioModel({
				nome: req.body.nome,
				valore: req.body.valore,
				tipo: req.body.tipo,
				descrizione: req.body.descrizione,
				costo_punti: req.body.costo_punti,
				idAzienda: req.body.idAzienda,
				validitaBuono: req.body.validitaBuono,  // Numero di giorni di validità del buono
			});
			result.premi.push(newPremio);
			result.save();
			newPremio.save();

			return res.location("/api/v1/aziende/" + result._id + "/premi/" + aziendaModel._id).status(201).send({ success: true });
		})
		.catch((error) => {
			console.error('Azienda non trovata');
			return res.status(404).json({ success: false, error: 'Azienda not found' });
		});
});

/**  
 * Update azienda's info
 * 
 * PUT /api/v1/aziende/{id}
 * 		Required fields: p_iva, email
 * 		Optional fields: password
*/
router.put("/:id", async (req, res) => {

	// Validate fields
	if (typeof req.body.email !== 'string' || !_isValidEmail(req.body.email) || _isEmptyString(req.body.email)) {
		console.error("The 'email' field must be a non-empty string in email format.");
		return res.status(400).json({ success: false, error: "The 'email' field must be a non-empty string in email format." });
	}


	aziendaModel.findById(req.params.id)
		.then((result) => {

			// Update azienda
			result.email = req.body.email;

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
			console.error('Azienda not found');
			return res.status(404).json({ success: false, error: 'Azienda not found' });
		});
});

function _isValidEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function _isEmptyString(str) {
	return str.length === 0;
}

module.exports = router;
