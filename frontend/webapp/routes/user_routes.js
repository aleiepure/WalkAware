// Import required modules
const express = require('express');
const path = require('path');
const jwt = require('jsonwebtoken');
const { sha512 } = require('js-sha512');
require('dotenv').config();

// Create router
const router = express.Router();

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080";

// Route register web user
router.get('/', (req, res) => {
	return res.render('registrazione', { currentPage: 'registrazione', isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
});

// Route to create a new web user NOT WORKING
router.post('/', async (req, res) => {
	// Make API request
	console.log(req.body);

	let hashedPassword = "";
	if (req.body.password) {
		hashedPassword = sha512.hmac("", req.body.password);
	}

	console.log({
		nome: req.body.nome,
		email: req.body.email,
		password: hashedPassword,
		supporto_tecnico: req.body.supporto_tecnico === 'true'
	});
	fetch(path.join(baseUrl, '/api/v1/utente/web'), {
		method: "POST",
		headers: { "Content-Type": "application/json", "x-access-token": req.cookies.token },
		body: JSON.stringify({
			nome: req.body.nome,
			email: req.body.email,
			password: hashedPassword,
			supporto_tecnico: req.body.supporto_tecnico === 'true'
		})
	})
		.then(response => {
			response.json()
				.then(body => {
					if (response.ok) {
						res.render('registrazione', { successMessage: "Utente regitrato correttamente", currentPage: 'registrazione', isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
					}
					else {
						res.render('registrazione', { errorMessage: body.error, currentPage: 'registrazione', isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
					}
				})
				.catch(jsonError => {
					console.error("Error parsing JSON response:", jsonError);
					return;
				});
		});
});


// Route for user login
router.post('/login', async (req, res) => {
	console.log("og pass: " + req.body.password);
	let hashedPassword = "";
	if (req.body.password) {
		hashedPassword = sha512.hmac("", req.body.password);
	}
	// Make API request

	fetch(path.join(baseUrl, '/api/v1/utente/web/login'), {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			email: req.body.email,
			password: hashedPassword,
		})
	})
		.then(response => {
			response.json()
				.then(body => {
					if (response.ok) {
						// response okay set cookies and redirect to segnalazioni page
						res.cookie('token', body.token, { httpOnly: true });
						res.cookie('nome', body.nome, { httpOnly: true });
						res.cookie('email', body.email, { httpOnly: true });
						res.cookie('userId', body.userId, { httpOnly: true });
						res.cookie('supporto_tecnico', body.supporto_tecnico, { httpOnly: true });
						return res.redirect('/segnalazioni');
					} else {
						// respone error, send error message to render
						console.log(body);
						return res.render('login', { errorMessage: body.error, currentPage: 'login', isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
					}

				})
				.catch(jsonError => {
					console.error("Error parsing JSON response:", jsonError);
				});
		});
});

// Route for user logout
router.get('/logout', async (req, res) => {
	res.clearCookie('token', { httpOnly: true });
	res.clearCookie('email', { httpOnly: true });
	res.clearCookie('userId', { httpOnly: true });
	res.clearCookie('nome', { httpOnly: true });
	res.clearCookie('supporto_tecnico', { httpOnly: true });

	res.redirect('/');
});


router.get('/modifica', function (req, res) {
	res.render('utente', { currentPage: 'utente', isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
});


router.put("/:id", async (req, res) => {
	let hashed_password = '';
	let hashed_password_again = "";
	let hashed_password_old = "";

	console.log("password: " + req.body.password);
	console.log("password again: " + req.body.password_again);
	console.log("password old: " + req.body.old_password);

	if (req.body.password) {
		hashed_password = sha512.hmac("", req.body.password);
	}
	if (req.body.password_again) {
		hashed_password_again = sha512.hmac("", req.body.password_again);
	}
	if (req.body.old_password) {
		hashed_password_old = sha512.hmac("", req.body.old_password);
	}


	fetch(path.join(baseUrl, "/api/v1/utente/web/" + req.params.id), {
		method: "PUT",
		headers: { "x-access-token": req.cookies.token, "Content-Type": "application/json" },
		body: JSON.stringify({
			nome: req.body.nome,
			email: req.body.email,
			password: hashed_password,
			password_again: hashed_password_again,
			old_password: hashed_password_old
		})
	})
		.then(response => {
			response.json()
				.then(body => {
					if (response.ok) {
						res.cookie('nome', req.body.nome, { httpOnly: true });
						res.cookie('email', req.body.email, { httpOnly: true });
						res.render('utente', { successMessage: "Utente modificato correttamente", currentPage: 'utente', isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
						//res.redirect("segnalazioni");

					}
					else {
						res.render('utente', { errorMessage: body.error, currentPage: 'utente', isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
					}
				})
				.catch(jsonError => {
					console.error("Error parsing JSON response:", jsonError);
				});
		});
});

module.exports = router;
