const express = require('express');
const path = require('path');
const { sha512 } = require('js-sha512');

const router = express.Router();

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080/";


router.get('/', async (req, res) => {
  const response = await fetch(path.join(baseUrl, "/api/v1/aziende"), {
    method: "GET",
    headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token },
  });

  const json = await response.json();
  res.render('aziende', { currentPage: 'aziende', aziende: json.aziende, isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
});

router.post("/", async (req, res) => {
  let hashed_password = '';

  if (req.body.password) {
    hashed_password = sha512.hmac("", req.body.password);
  }

  fetch(path.join(baseUrl, "/api/v1/aziende"), {
    method: "POST",
    headers: { "x-access-token": req.cookies.token, "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: req.body.nome,
      email: req.body.email,
      password: hashed_password,
      p_iva: req.body.p_iva
    })
  })
    .then(response => {
      response.json()
        .then(body => {
          if (response.ok) {
            res.redirect("/aziende");
          }
          else {
            res.redirect("/aziende?error=Qualcosa%20C3%A%20andato%20storto");
          }
        })
        .catch(jsonError => {
          console.error("Error parsing JSON response:", jsonError);
        });
    });
});


router.get('/modifica', async (req, res) => {
  const response = await fetch(path.join(baseUrl, `/api/v1/aziende/${req.query.id}`), {
    method: "GET",
    headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token },
  });

  const json = await response.json();
  console.log(json)
  console.log(json.azienda)
  res.render('modifica_azienda', { currentPage: 'modifica_azienda', azienda: json.azienda, isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
});

router.put("/:id", async (req, res) => {

  // let hashed_password = '';

  // if (req.body.password) {
  //   hashed_password = sha512.hmac("", req.body.password);
  // }
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



  fetch(path.join(baseUrl, "/api/v1/aziende/" + req.params.id), {
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
    .then(async(response) => {
      
      response.json()
        .then(async(body) => {
          let azienda = await fetch(path.join(baseUrl, `/api/v1/aziende/${req.params.id}`), {
            method: "GET",
            headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token },
          })
          let json = await azienda.json();
          console.log(json)
          if (response.ok) {
            //res.render('modifica_azienda', { successMessage: "Azienda modificata correttamente", currentPage: 'modifica_azienda', azienda: json.azienda, isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
            res.redirect('/aziende')
          }
          else {
            res.render('modifica_azienda', { errorMessage: body.error, currentPage: 'modifica_azienda', azienda: json.azienda, isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
          }
        })
        .catch(jsonError => {
          console.error("Error parsing JSON response:", jsonError);
        });
    });
});

router.post("/:id/premi", (req, res) => {
  fetch(path.join(baseUrl, "/api/v1/aziende/" + req.params.id + "/premi"), {
    method: "POST",
    headers: { "x-access-token": req.cookies.token, "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: req.body.nome,
      valore: parseInt(req.body.valore),
      tipo: req.body.tipo,
      descrizione: req.body.descrizione,
      costo_punti: parseInt(req.body.costo_punti),
      validitaBuono: parseInt(req.body.validitaBuono),
      idAzienda: req.body.idAzienda
    }),
  })
    .then(response => {
      response.json()
        .then(body => {
          if (response.ok) {
            res.redirect("/aziende");
          }
          else {
            res.redirect("/aziende?error=Qualcosa%20C3%A%20andato%20storto");
          }
        })
        .catch(jsonError => {
          console.error("Error parsing JSON response:", jsonError);
        });
    });
});

module.exports = router;