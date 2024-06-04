const express = require('express');
const axios = require('axios');
const router = express.Router();
const path = require('path');
require('dotenv').config();

const baseUrl = process.env.BACKEND_BASE_URL || "http://localhost:8080";

router.get("/", async (req, res) => {
  try {
    const segnalazioniResponse = await fetch(path.join(baseUrl, "/api/v1/segnalazioni"), {
      method: "GET",
      headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token },
    });

    if (!segnalazioniResponse.ok) {
      console.error("Errore: la risposta non è ok");
      return res.status(500).send("Errore nel recupero delle segnalazioni");
    }

    const segnalazioniData = await segnalazioniResponse.json();


    await Promise.all(segnalazioniData.segnalazioni.map(async (segnalazione) => {
      // get images taken by user
      if (segnalazione.foto !== '') {
        const immagineResponse = await fetch(path.join(baseUrl, `/api/v1/segnalazioni/immagini/${segnalazione.foto}`), {
          method: "GET",
          headers: { "Content-Type": "application/json", 'x-access-token': req.cookies.token },
        });
        if (immagineResponse.ok) {
          const immagineData = await immagineResponse.json();
          segnalazione.foto = immagineData.imageUrl;
        } else {
          console.error("Errore nel recupero dell'immagine per la segnalazione:", segnalazione.id);
        }
      }


      // get maps images
      try {
        const mapImg = await getImageDataUrl(segnalazione.luogo);
        if (mapImg) {
          segnalazione.map_img = mapImg;
        } else {
          console.error("Impossibile trovare l'immagine per le coordinate fornite per la segnalazione:", segnalazione.id);
        }
      } catch (error) {
        console.error("Errore nel recupero dell'immagine per la segnalazione:", segnalazione.id);
      }


      // get address name
      try {
        const formattedAddress = await getFormattedAddress(segnalazione.luogo);
        if (formattedAddress) {
          segnalazione.luogo = formattedAddress;
        } else {
          console.error("Impossibile trovare l'indirizzo per le coordinate fornite per la segnalazione:", segnalazione.id);
        }
      } catch (error) {
        console.error("Errore nel recupero dell'indirizzo per la segnalazione:", segnalazione.id, error.message);
      }
    }));

    res.render('segnalazioni', { currentPage: 'segnalazioni', segnalazioni: segnalazioniData.segnalazioni, isSupportoTecnico: req.cookies.supporto_tecnico, nome: req.cookies.nome, email: req.cookies.email, id_web: req.cookies.userId });
  } catch (error) {
    console.error("Errore generale:", error);
    res.status(500).send("Errore generale nella gestione delle segnalazioni");
  }
});

router.put("/:id", (req, res) => {

  console.log(JSON.stringify(req.body));
  fetch(path.join(baseUrl, `/api/v1/segnalazioni/${req.params.id}`), {
    method: "PUT",
    headers: { "x-access-token": req.cookies.token, "Content-Type": "application/json" },
    body: JSON.stringify(req.body)
  })
    .then(response => {
      if (response.ok) {
        console.log("PUT request successful. Redirecting to /segnalazioni");
        res.redirect("/segnalazioni");
      }
      else {
        console.error("PUT request failed. Redirecting to /segnalazioni with error.");
        res.redirect("/segnalazioni?error=Qualcosa%20C3%A%20andato%20storto");
      }
    })
    .catch(jsonError => {
      console.error("Error parsing JSON response:", jsonError);
    });

});



// Return base64 image of the position
async function getImageDataUrl(coordinates) {
  const zoom = 16;
  const size = '400x400';
  const marker = `color:red|label:L|${coordinates}`;
  const mapUrl = `https://maps.googleapis.com/maps/api/staticmap?center=${coordinates}&zoom=${zoom}&size=${size}&markers=${marker}&key=${process.env.GOOGLE_API_KEY}`;

  try {
    const response = await axios.get(mapUrl, {
      responseType: 'arraybuffer'
    });

    if (!response.data || !Buffer.isBuffer(response.data)) {
      throw new Error('Errore nel recupero dell\'immagine: risposta non valida');
    }

    const base64ImageData = Buffer.from(response.data, 'binary').toString('base64');
    const imageDataUrl = `data:image/png;base64,${base64ImageData}`;

    return imageDataUrl;
  } catch (error) {
    console.error('Errore nel recupero dell\'immagine:', error.message);
    throw error;
  }
}

// Return address from coordinates
async function getFormattedAddress(coordinates) {
  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coordinates}&key=${process.env.GOOGLE_API_KEY}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Errore nella richiesta: ${response.status} - ${response.statusText}`);
    }

    const data = await response.json();
    if (data.status === 'OK') {
      // extract street name
      const formattedAddress = data.results[0].address_components[1].short_name;
      return formattedAddress;
    } else {
      throw new Error(`Errore nella risposta API: ${data.status}`);
    }
  } catch (error) {
    console.error('Errore durante la richiesta di geocoding:', error.message);
    return null;
  }
}

module.exports = router;