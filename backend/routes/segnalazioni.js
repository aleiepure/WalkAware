const express = require('express');
const minio = require("minio")
const multer = require('multer')

const immagineModel = require("../models/immagine.js")
const segnalazioneModel = require("../models/segnalazione.js");
const segnalazione = require('../models/segnalazione.js');
require('dotenv').config();
const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const s3Client = new minio.Client({
    endPoint: `${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    useSSL: true,
    accessKey: process.env.R2_ACCESS_KEY_ID,
    secretKey: process.env.R2_SECRET_ACCESS_KEY,
})


/**  
 * Upload an image
 * 
 * POST /api/v1/segnalazioni/immagini
 * 		Required fields: immagine
*/

router.post('/immagini', upload.single('image'), async (req, res) => {

    console.log(req.file);
    if (!req.file){
        console.error("No image provided");
        return res.status(400).json({success: false, error: "No image provided"})
    }

    var convertedImage = req.file.buffer.toString('base64');
    const base64Image = Buffer.from(
        convertedImage.replace(/^data:image\/\w+;base64,/, ""), // questo non so se funziona
        "base64"
    );
    const imageType = req.file.mimetype.split(';')[0].split('/')[1];

    const key = `${crypto.randomUUID()}.${imageType}`; // trovare un modo per generare un nome univoco, stesso nome = sovrascrittura
    const size = base64Image.length;
    const metaData = {
        'Content-Type': `image/${imageType}`,
        'ContentEncoding': 'base64',
    };

    // upload
    await s3Client.putObject('walkaware', key, base64Image, size, metaData)
        .then((result) => { console.log(result) })
        .catch((err) => { console.error(err) });

    // generazione url di download, se lo apri nel browser scarica l'immagine
    // await s3Client.presignedGetObject('walkaware', key, 60).then((result) => {
    //  console.log(result);
    // });
    
    return res.json({ success: true, imageKey: key })

});

// /**  
//  * Download an image
//  * 
//  * GET /api/v1/segnalazioni/immagini/{id}
// */

router.get("/immagini/:id", async (req, res) => {
    if (!req.params.id){
        console.error("No image requested");
        return res.status(400).json({success: false, error: "No image requested"})
    }
    try {
        let urlImage = "";
        await s3Client.presignedGetObject('walkaware', req.params.id, 60).then((result) => {
            console.log(result);
            urlImage = result;
            return res.json({success: true, url: urlImage});
            });
            

        if (!image) {
            console.error("Image with specified id not found");
            return res.status(404).json({ success: false, error: "Image with specified id not found" });
        }

        
    } catch (error) {
        console.error("Error retrieving image:", error.message);
        return res.status(500).json({ success: false, error: "Error retrieving image" });
    }
});

/**  
 * Get all segnalazione
 * 
 * GET /api/v1/segnalazioni
 * 
*/
router.get("", async (req, res) => {

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