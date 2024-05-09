const express = require('express');
const aziendaModel = require('../models/azienda')
const bcrypt = require('bcrypt')

const router = express.Router();

/*
nome: { type: String, required: true },
    p_iva: { type: Number, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
*/

router.post("/", async (req, res)=>{

	console.log(req.body)
    // Validate email field
	if (typeof req.body.email !== 'string' || !_isValidEmail(req.body.email)) {
		console.error("The 'email' field must be a non-empty string in email format.");
		return res.status(400).json({ success: false, error: "The 'email' field must be a non-empty string in email format." });
	}
	// Validate name field
	if (typeof req.body.nome !== 'string') {
		console.error("The 'nome' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'nome' field must be a non-empty string." });
	}
	// Validate op_iva field
	if (typeof req.body.p_iva !== 'string') {
		console.error("The 'P. IVA' field must be a string.");
		return res.status(400).json({ success: false, error: "The 'P. IVA' field must be a string." });
	}
	// Validate password field
	if (typeof req.body.password !== 'string') {
		console.error('The "password" field must be a non-empty string');
		return res.status(400).json({ success: false, error: 'The "password" field must be a non-empty string.' });
	}

    //let hashedPassword = bcrypt.hash(req.body.password)

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

router.get("/", async (req, res)=>{
	console.log(req.header)
	aziendaModel.find().then((azienda) => {
        return res.send(azienda);
    }).catch((error) => {
        console.error("Azienda not found");
        return res.status(404).json({ success: false, error: "Azienda not found" });
    })
})

router.get("/:id", async (req, res)=>{
	aziendaModel.findById(req.params.id).then((azienda) => {
        return res.send(azienda);
    }).catch((error) => {
        console.error("Azienda not found");
        return res.status(404).json({ success: false, error: "Azienda not found" });
    })
})





function _isValidEmail(email) {
	const re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
}

module.exports = router;