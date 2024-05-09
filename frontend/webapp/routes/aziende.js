const express = require('express');
const { token } = require('morgan');
const router = express.Router();
const multer = require("multer")
const upload = multer();

const backendURL = "http://localhost:8080/api/v1/aziende"

router.get('/', async (req, res) => {
    console.log(req.cookies.token);
    const response = await fetch(backendURL, {
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
    r
    console.log(JSON.stringify(req.body))
    fetch(backendURL, {
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