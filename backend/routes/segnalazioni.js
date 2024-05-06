const express = require('express');
const Immagine = require("../models/immagine.js")
const Segnalazioni = require("../models/segnalazione.js")

const router = express.Router();

router.post('/caricaImmagine', async (req, res) =>{
	let newImmagine = new Immagine({
		foto: req.body.foto
	})

	console.log("image ID" + newImmagine._id)
	await newImmagine.save()

	return res.location("/api/v1/segnalazioni/"+ newImmagine._id).status(201).send();

});


router.get("/:id", async (req, res) =>{
    let immagine = await Immagine.findById(req.params.id).exec();
	if (!immagine) {
		return res.status(404).json({ error: "Image does not exist" });
	}

	res.status(200).json(immagine)

});

router.get(" ", async (req, res) =>{
	

});

module.exports = router;