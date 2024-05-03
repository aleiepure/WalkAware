// Import required modules
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');

const backendURL = "http://localhost:8080/api/v1/"
// Create router
const router = express.Router();



// Route to create a new web user
router.post('/', async (req, res) => {
	// Make API request
	console.log(req.body);
	fetch(path.join(backendURL, '/utente/web'), {
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
	  console.log(req.body);
	  fetch(path.join(backendURL, 'utente/web/login'), {
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
				res.cookie('id', body.id, { httpOnly: true });
				res.render('segnalazioni', {currentPage: 'segnalazioni'});
			}else{
				// respone error, send error message to render
				res.render('login', {errorMessage: body.error});
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
	res.clearCookie('id', { httpOnly: true });
	
	res.redirect('/');
})




module.exports = router;
