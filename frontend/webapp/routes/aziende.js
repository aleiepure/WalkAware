const express = require('express');
const router = express.Router();



const backendURL = "http://localhost:8080/api/v1/aziende"

router.get('/', (req, res) => {
    let aziende = [];
    fetch(backendURL, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
        .then((response) => {
            response.json()
                .then((body) => {
                    aziende = body;
                    res.render('aziende', { currentPage: 'aziende' , aziende: aziende});
                }
                )
        })

});


module.exports = router