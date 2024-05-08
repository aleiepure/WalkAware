const express = require('express');
const minio = require("minio");
const multer = require('multer');

const immagineModel = require("../models/immagine.js");
const segnalazioneModel = require("../models/segnalazione.js");
const segnalazione = require('../models/segnalazione.js');

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
        return res.status(400).json({ success: false, error: "No image provided" })
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
    await s3Client.putObject('walkaware', key, base64Image, size, metaData)
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
router.get("/immagini/:id", async (req, res) => {
    await s3Client.presignedGetObject('walkaware', req.params.id, 60)
        .then((result) => {
            return res.json({ success: true, imageKey: result });
        }).catch((error) => {
            console.error("Error retrieving image:", error.message);
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

    // const segnalazioni = await segnalazioneModel.find();
    // return res.send(segnalazioni)
    segnalazioneModel.find().then((segnalazione) => {
        return res.send(segnalazione);
    }).catch((error) => {
        console.error("Segnalazioni not found");
        return res.status(404).json({ success: false, error: "Segnalazioni not found" });
    })
});

/**  
 * Get a segnalazione
 * 
 * GET /api/v1/segnalazioni/{id}
*/
router.get("/:id", async (req, res) => {
    segnalazioneModel.findById(req.params.id).then((segnalazione) => {
        return res.send(segnalazione);
    }).catch((error) => {
        console.error("Segnalazione not found");
        return res.status(404).json({ success: false, error: "Segnalazione not found" });
    })

});

module.exports = router;