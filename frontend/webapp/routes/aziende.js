const express = require('express');
const router = express.Router();
const path = require('path');
require('dotenv').config();

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080/"

router.get('/', async (req, res) => {
    console.log(req.cookies.token);
    const response = await fetch(path.join(baseUrl, "/api/v1/aziende"), {
        method: "GET",
        headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token },
    })

    const aziende = await response.json();
    console.log(aziende);
    res.render('aziende', { currentPage: 'aziende', aziende: aziende });


});

router.post("/", (req, res)=>{
    // await fetch(backendURL, {
    //     method: "POST", 
    //     headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token },
    //     body: JSON.stringify(req.body)
    // })
    
    console.log(JSON.stringify(req.body))
    fetch(path.join(baseUrl, "/api/v1/aziende"), {
		method: "POST",
		headers: { "x-access-token": req.cookies.token, "Content-Type": "application/json"},
		body: JSON.stringify(req.body)
	  })
	  .then(response => {
		response.json()
        .then(body => {
			if(response.ok){
				res.redirect("/aziende")
      }
      else{
        res.redirect("/aziende?error=Qualcosa%20C3%A%20andato%20storto")
      }
		})
        .catch(jsonError => {
          console.error("Error parsing JSON response:", jsonError);
        });
	  })


})

module.exports = router