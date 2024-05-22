const express = require('express');
const aziendaModel = require('../models/azienda');
const bcrypt = require('bcrypt');
const router = express.Router();
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
	if (typeof req.body.tipo !== 'string' || !["percentuale", "contante", "omaggio", "quantità"].includes(req.body.tipo)) {
		console.error("The 'tipo' field must be either 'percentuale', 'contante', 'omaggio' or 'quantità'.");
		return res.status(400).json({ success: false, error: "The 'tipo' field must be either 'percentuale', 'contante', 'omaggio' or 'quantità'." });
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

function _isValidEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

function _isEmptyString(str) {
	return str.length === 0;
}

module.exports = router;
