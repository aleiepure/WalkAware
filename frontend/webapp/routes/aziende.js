const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');

require('dotenv').config();

const router = express.Router();

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080/"

router.get('/', async (req, res) => {
    const response = await fetch(path.join(baseUrl, "/api/v1/aziende"), {
        method: "GET",
        headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token },
    })

    const json = await response.json();
    console.log(json.aziende);
    res.render('aziende', { currentPage: 'aziende', aziende: json.aziende, isSupportoTecnico: req.cookies.supporto_tecnico });
});

router.post("/", async (req, res)=>{
    // await fetch(backendURL, {
    //     method: "POST", 
    //     headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token },
    //     body: JSON.stringify(req.body)
    // })
    
    console.log(JSON.stringify(req.body))
    let hashed_password = await bcrypt.hash(req.body.password, 10)
    console.log(hashed_password)
    fetch(path.join(baseUrl, "/api/v1/aziende"), {
		method: "POST",
		headers: { "x-access-token": req.cookies.token, "Content-Type": "application/json"},
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

router.post("/:id/premi", (req, res)=>{
  // await fetch(backendURL, {
  //     method: "POST", 
  //     headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token },
  //     body: JSON.stringify(req.body)
  // })
  
  console.log(JSON.stringify(req.body))
  fetch(path.join(baseUrl, "/api/v1/aziende/"+req.params.id+"/premi"), {
  method: "POST",
  headers: { "x-access-token": req.cookies.token, "Content-Type": "application/json"},
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