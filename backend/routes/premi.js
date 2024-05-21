const express = require('express');
const premioModel = require('../models/premio');

const router = express.Router();

/**  
 * Get all premi
 * 
 * GET /api/v1/premi
*/
router.get('/', (req, res) => {
    premioModel.find().then((premi) => {
        return res.json({ success: true, premi: premi });
    })
    .catch((err) => {
        console.error("Premi not found");
		return res.status(404).json({ success: false, error: "Premi not found" });
    });
});

module.exports = router;