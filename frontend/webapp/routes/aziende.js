const express = require('express');
require('dotenv').config();

const router = express.Router();

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080"

router.get('/', (req, res) => {
    let aziende = [];
    fetch(path.join(baseUrl, 'api/v1/aziende'), {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((response) => {
            response.json()
                .then((body) => {
                    aziende = body;
                    res.render('aziende', { currentPage: 'aziende' , aziende: aziende});
                })
        })

});


module.exports = router