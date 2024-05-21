const express = require('express');
const aziendaModel = require('../models/azienda');
const bcrypt = require('bcrypt');
const router = express.Router();
const premioModel = require('../models/premio');

/*
nome: { type: String, required: true },
	p_iva: { type: Number, required: true },
	email: { type: String, required: true },
	password: { type: String, required: true }
*/
router.post("/", async (req, res) => {

	console.log(req.body);
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
	// Validate op_iva field
	if (typeof req.body.p_iva !== 'string' || _isEmptyString(req.body.email)) {
		console.error("The 'P. IVA' field must be a string.");
		return res.status(400).json({ success: false, error: "The 'P. IVA' field must be a string." });
	}
	// Validate password field
	if (typeof req.body.password !== 'string' || _isEmptyString(req.body.password)) {
		console.error('The "password" field must be a non-empty string');
		return res.status(400).json({ success: false, error: 'The "password" field must be a non-empty string.' });
	}

	//let hashedPassword = bcrypt.hash(req.body.password)

	// User not found
	const existingAzienda = await aziendaModel.findOne({ email: req.body.email });
	if (existingAzienda) {
		console.error('An azienda with the same email already exists.');
		return res.status(401).json({ success: false, error: 'An azienda with the same email already exists.' });
	}

	// Create new user
	const azienda = new aziendaModel({
		email: req.body.email,
		password: req.body.password,
		nome: req.body.nome,
		p_iva: req.body.p_iva
	});
	await azienda.save();

	//response 
	return res.status(201).location("/api/v1/aziende" + azienda._id).send({ success: true });
});

router.get("/", async (req, res) => {
	aziendaModel.find().then((aziende) => {
		return res.json({ success: true, aziende: aziende });
	}).catch((error) => {
		console.error("Azienda not found");
		return res.status(404).json({ success: false, error: "Azienda not found" });
	});
});

router.get("/:id", async (req, res) => {
	aziendaModel.findById(req.params.id).then((azienda) => {
		return res.json({ success: true, azienda: azienda });
	}).catch((error) => {
		console.error("Azienda not found");
		return res.status(404).json({ success: false, error: "Azienda not found" });
	});
});


/* 
	Aggiungere premi per ogni azienda
*/

router.post("/:id/premi", async (req, res) => {
	if (typeof req.body.nome !== 'string' || _isEmptyString(req.body.nome)) {
		console.error("The 'nome' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'nome' field must be a non-empty string." });
	}
	if (typeof req.body.valore !== 'number' || req.body.valore < 0) {
		console.error("The 'valore' field must be a positive number.");
		return res.status(400).json({ success: false, error: "The 'valore' field must be positive number." });
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
		return res.status(400).json({ success: false, error: "The 'costo_punti' field must be positive number." });
	}
	if (typeof req.body.idAzienda !== 'string' || _isEmptyString(req.body.idAzienda)) {
		console.error("The 'idAzienda' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'idAzienda' field must be a non-empty string." });
	}
	if (typeof req.body.validitaBuono !== 'number' || req.body.validitaBuono < 0) {
		console.error("The 'validitaBuono' field must be a positive number.");
		return res.status(400).json({ success: false, error: "The 'validitaBuono' field must be positive number." });
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
		.catch((error)=>{
			console.error('Azienda non trovata');
			return res.status(404).json({ success: false, error: 'Azienda non trovata' });
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