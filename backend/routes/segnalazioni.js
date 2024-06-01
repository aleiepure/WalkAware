const express = require('express');
const minio = require("minio");
const multer = require('multer');
let crypto;
try {
    crypto = require('node:crypto');
} catch (err) {
    console.error('crypto support is disabled!');
}

const immagineModel = require("../models/immagine.js");
const segnalazioneModel = require("../models/segnalazione.js");
const { utenteMobileModel } = require('../models/utente_mobile.js');

require('dotenv').config();

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const s3Client = new minio.Client({
    endPoint: `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    accessKey: process.env.R2_ACCESS_KEY_ID,
    secretKey: process.env.R2_SECRET_ACCESS_KEY,
});

/**  
 * Upload an image
 * 
 * POST /api/v1/segnalazioni/immagini
 * 		Required fields: immagine
*/
router.post('/immagini', upload.single('image'), async (req, res) => {

    // Check if an image was provided
    if (!req.file) {
        console.error("No image provided");
        return res.status(400).json({ success: false, error: "No image provided" });
    }

    // Prepare the image to be uploaded
    var convertedImage = req.file.buffer.toString('base64');
    const base64Image = Buffer.from(
        convertedImage.replace(/^data:image\/\w+;base64,/, ""), // questo non so se funziona
        "base64"
    );
    const imageType = req.file.mimetype.split(';')[0].split('/')[1];

    // Upload the image to the S3 bucket
    const key = `${crypto.randomUUID()}.${imageType}`;
    const size = base64Image.length;
    const metaData = {
        'Content-Type': `image/${imageType}`,
        'ContentEncoding': 'base64',
    };
    s3Client.putObject('walkaware', key, base64Image, size, metaData)
        .then((result) => {
            console.log('Successfully uploaded the image with key:', key);
            return res.json({ success: true, imageKey: key });
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ success: false, error: "Error uploading image" });
        });
});

/**  
 * Download an image
 * 
 * GET /api/v1/segnalazioni/immagini/{id}
*/
router.get("/immagini/:imageKey", async (req, res) => {
    s3Client.presignedGetObject('walkaware', req.params.imageKey, 60)
        .then((result) => {
            return res.json({ success: true, imageUrl: result });
        }).catch((err) => {
            console.error("Error retrieving image:", err);
            return res.status(500).json({ success: false, error: "Error retrieving image" });
        });
});

/**  
 * Get all segnalazione
 * 
 * GET /api/v1/segnalazioni
 * 
*/
router.get("/", async (req, res) => {
    segnalazioneModel.find()
        .then((segnalazione) => {
            return res.json({ success: true, segnalazioni: segnalazione });
        }).catch(() => {
            console.error("Segnalazioni not found");
            return res.status(404).json({ success: false, error: "Segnalazioni not found" });
        });
});

/**  
 * Get a segnalazione
 * 
 * GET /api/v1/segnalazioni/{id}
*/
router.get("/:id", async (req, res) => {
    segnalazioneModel.findById(req.params.id)
        .then((segnalazione) => {
            return res.json({ success: true, segnalazione: segnalazione });
        }).catch(() => {
            console.error("Segnalazione not found");
            return res.status(404).json({ success: false, error: "Segnalazione not found" });
        });

});

/**  
 * PUT a segnalazione  
 * 
 * PUT /api/v1/segnalazioni/{id}
 *		Required fields: id
*/
router.put("/:id", async (req, res) => {
    try {
        // Validate status field
        const validStatuses = ['aperta', 'presa_in_carico', 'conclusa'];
        const { status } = req.body;
        if (typeof status !== 'string' || !validStatuses.includes(status)) {
            console.error('The optional "status" field must be either "aperta", "presa_in_carico" or "conclusa".');
            return res.status(400).json({ success: false, error: "The optional 'status' field must be either 'aperta', 'presa_in_carico' or 'conclusa'." });
        }

        // Find the segnalazione by ID
        const segnalazione = await segnalazioneModel.findById(req.params.id);
        if (!segnalazione) {
            console.error("Segnalazione not found");
            return res.status(404).json({ success: false, error: "Segnalazione not found" });
        }

        // Update the status of the segnalazione
        segnalazione.status = status;
        await segnalazione.save();

        // Find the user by ID
        const utente = await utenteMobileModel.findById(segnalazione.id_utente);
        if (!utente) {
            console.error('User not found with the specified ID.');
            return res.status(404).json({ success: false, error: 'User not found with the specified ID.' });
        }

        // Find the specific segnalazione within the user's segnalazioni and update its status
        let segnalazioneUtente = utente.segnalazioni.find(s => s._id.equals(segnalazione.id_segnalazione));
        if (segnalazioneUtente) {
            segnalazioneUtente.status = status;
            await utente.save();
        } else {
            console.error('Segnalazione not found in user\'s segnalazioni.');
            return res.status(404).json({ success: false, error: 'Segnalazione not found in user\'s segnalazioni.' });
        }

        // Respond with success
        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('An error occurred:', error);
        return res.status(500).json({ success: false, error: 'An internal error occurred' });
    }
});


module.exports = router;
