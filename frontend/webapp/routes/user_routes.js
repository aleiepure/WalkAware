// Import required modules
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Create router
const router = express.Router();

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080"

// Route to create a new web user NOT WORKING
router.post('/', async (req, res) => {
	// Make API request
	console.log(req.body);
	fetch(path.join(baseUrl, '/api/v1/utente/web'), {
	  method: "POST",
	  headers: {"Content-Type": "application/json"},
	  body: JSON.stringify(req.body)
	})
	.then(response => {
	  response.json()
	  .then(body => {
		res.send(body);
	  })
	  .catch(jsonError => {
		console.error("Error parsing JSON response:", jsonError);
	  });
	})
});



// Route for user login
router.post('/login', async (req, res) => {
	  // Make API request
	  //console.log(req.body);
	  fetch(path.join(baseUrl, '/api/v1/utente/web/login'), {
		method: "POST",
		headers: {"Content-Type": "application/json"},
		body: JSON.stringify(req.body)
	  })
	  .then(response => {
		response.json()
        .then(body => {
			if(response.ok){
				// response okay set cookies and redirect to segnalazioni page
				res.cookie('token', body.token, { httpOnly: true });
				res.cookie('email', body.email, { httpOnly: true });
				res.cookie('userId', body.userId, { httpOnly: true });
				res.redirect('/segnalazioni');
			}else{
				// respone error, send error message to render
				res.redirect('/');
			}

		})
        .catch(jsonError => {
          console.error("Error parsing JSON response:", jsonError);
        });
	  })
})

// Route for user logout
router.get('/logout', async (req, res) => {
	res.clearCookie('token', { httpOnly: true });
	res.clearCookie('email', { httpOnly: true });
	res.clearCookie('userId', { httpOnly: true });
	res.redirect('/');
})


module.exports = router;
