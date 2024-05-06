const express = require('express');

const immagineModel = require("../models/immagine.js")
const segnalazioneModel = require("../models/segnalazione.js");
const segnalazione = require('../models/segnalazione.js');
const router = express.Router();

/**  
 * Upload an image
 * 
 * POST /api/v1/segnalazioni/immagini
 * 		Required fields: immagine
*/
router.post('/immagini', async (req, res) => {

	// Validate immagine field
	// TODO: change the type and error string
	if (typeof req.body.immagine !== 'string') {
		console.error("The 'immagine' field must be a non-empty string.");
		return res.status(400).json({ success: false, error: "The 'immagine' field must be a non-empty string." });
	}

	// Create new image
	let newImmagine = new immagineModel({
		immagine: req.body.immagine
	})
	await newImmagine.save()

	return res.location("/api/v1/segnalazioni/immagini/" + newImmagine._id).status(201).send({ success: true });
});

/**  
 * Download an image
 * 
 * GET /api/v1/segnalazioni/immagini/{id}
*/
router.get("/immagini/:id", async (req, res) => {

	// image not found
	immagineModel.findById(req.params.id)
		.then((result) => {
			// TODO: check if this is the correct way to send an image
			return res.send(result.immagine);
		})
		.catch((error) => {
			console.error("Image with specified id not found");
			return res.status(404).json({ success: false, error: "Image with specified id not found" });
		});
});

/**  
 * Get all segnalazione
 * 
 * GET /api/v1/segnalazioni
 * 
*/
router.get("", async (req, res)=>{

	// const segnalazioni = await segnalazioneModel.find();
	// return res.send(segnalazioni)
	segnalazioneModel.find().then((segnalazione)=>{
		return res.send(segnalazione);
	}).catch((error)=> {
		console.error("Segnalazioni not found");
		return res.status(404).json({ success: false, error: "Segnalazioni not found" });
	})
});

/**  
 * Get a segnalazione
 * 
 * GET /api/v1/segnalazioni/{id}
*/
router.get("/:id", async(req, res)=>{
	segnalazioneModel.findById(req.params.id).then((segnalazione)=>{
		return res.send(segnalazione);
	}).catch((error)=>{
		console.error("Segnalazione not found");
		return res.status(404).json({ success: false, error: "Segnalazione not found" });
	})

});

module.exports = router;