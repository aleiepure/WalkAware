const express = require('express');
const router = express.Router();
const path = require('path');
const {sha512} = require('js-sha512');
require('dotenv').config();

const { verifyToken } = require("../auth/tokenChecker.js");

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080";

router.get("/", async (req, res) => {
    if (verifyToken(req.cookies)) {
        res.redirect(`valida_buono/conferma?buono=${req.query.buono}`);
    } else {
        return res.render("login_aziende", { currentPage: 'login_aziende' });
    }
});

router.post("/login", async (req, res) => {
	if (req.body.password) {
        req.body.password = sha512.hmac("", req.body.password);
	}
    fetch(path.join(baseUrl, '/api/v1/aziende/login'), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(req.body)
    })
        .then(response => {
            response.json()
                .then(body => {
                    if (response.ok) {
                        // response okay set cookies and redirect to segnalazioni page
                        res.cookie('token', body.token, { httpOnly: true });
                        res.cookie('email', body.email, { httpOnly: true });
                        res.cookie('userId', body.userId, { httpOnly: true });
                        console.log(body);
                        return res.redirect(`conferma?buono=${req.query.buono}`);
                    } else {
                        // respone error, send error message to render
                        console.log(body);
                        return res.render('login_aziende', { errorMessage: body.error, currentPage: 'login_aziende' });
                    }
                })
                .catch(jsonError => {
                    console.error("Error parsing JSON response:", jsonError);
                    return res.render('login_aziende', { errorMessage: body.error, currentPage: 'login_aziende' });
                });
        });
});

router.get("/conferma", async (req, res) => {
    fetch(path.join(baseUrl, `/api/v1/buoni/${req.query.buono}`), {
        method: "GET",
        headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token }
    })
        .then(response => {
            response.json()
                .then(body => {
                    if (response.ok) {
                        console.log(body);
                        return res.render('valida_buono', { currentPage: 'valida_buono', buono: body.buoni });
                    } else {
                        // respone error, send error message to render
                        console.log(body);
                        return res.render('valida_buono', { errorMessage: body.error, currentPage: 'valida_buono', buono: body.buoni });
                    }
                })
                .catch(jsonError => {
                    console.error("Error parsing JSON response:", jsonError);
                    return res.render('valida_buono', { errorMessage: jsonError, currentPage: 'valida_buono', buono: body.buoni });
                });
        });
});

router.post("/conferma", async (req, res) => {
    console.log("buono: "+req.query.buono);
    fetch(path.join(baseUrl, `/api/v1/buoni/${req.query.buono}/valida`), {
        method: "PUT",
        headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token }
    })
        .then(response => {
            response.json()
                .then(body => {
                    if (response.ok) {
                        console.log(body);
                        return res.render('valida_buono', { successMessage: "Il buono è stato confermato con successo !", currentPage: 'valida_buono'});
                    } else {
                        // respone error, send error message to render
                        return res.render('valida_buono', { errorMessage: body.error, currentPage: 'valida_buono'});
                    }
                })
                .catch(jsonError => {
                    console.error("Error parsing JSON response:", jsonError);
                    return;
                });
        })
        .catch(jsonError => {
            console.error("Error parsing JSON response:", jsonError);
            return;
        });
});


module.exports = router;