const express = require('express');
const buonoModel = require('../models/buono');
const { utenteMobileModel } = require('../models/utente_mobile.js');

const router = express.Router();

router.put("/:id/valida", async (req, res) => {
    buonoModel.findOne({ id_buono: req.params.id })
        .then((buono) => {
            console.log(buono);
            utenteMobileModel.findById(buono.id_utente)
                .then((utente) => {
                    console.log(utente);

                    let buonoUtente = utente.buoni.find(s => s._id.equals(buono.id_buono));

                    if (!buonoUtente) {
                        console.error('buono not found in utente mobile buoni.');
                        return res.status(404).json({ success: false, error: 'Buono not found in utente mobile buoni.' });
                    }

                    let today = new Date();
                    let buonoDate = new Date(buono.data_riscatto); //date
                    let validita = buono.validitaBuono; //int in days

                    let compareDate = new Date(buonoDate);
                    compareDate.setDate(buonoDate.getDate() + validita);

                    if (compareDate.getTime() >= today.getTime() && buono.usato === false) {
                        buono.usato = true;
                        buonoUtente.usato = true;
                        utente.save();
                        buono.save();
                        console.log("Arrivo a salvare");
                        return res.json({ success: true, usato: buono.usato });
                    } else if (buono.usato == true) {
                        console.error("Buono già utilizzato");
                        return res.status(400).json({ success: false, error: "Buono già utilizzato" });
                    } else if (compareDate < today) {
                        console.error("Buono scaduto");
                        return res.status(400).json({ success: false, error: "Buono scaduto" });
                    }

                })
                .catch((error) => {
                    console.error('Utente non trovato con l\'ID specificato', error);
                    return res.status(404).json({ success: false, error: 'Utente non trovato con l\'ID specificato' });
                });
        })
        .catch((error) => {
            console.error('Buono non trovato con l\'ID specificato', error);
            return res.status(404).json({ success: false, error: 'Buono non trovato con l\'ID specificato' });
        });

});

router.get("/:id", async (req, res) => {
    buonoModel.findOne({ id_buono: req.params.id })
        .then((buono) => {
            console.log(buono);
            utenteMobileModel.findById(buono.id_utente)
                .then((utente) => {
                    let buonoUtente = utente.buoni.find(s => s._id.equals(buono.id_buono));
                    if (!buonoUtente) {
                        console.error('buono not found in utente mobile buoni.');
                        return res.status(404).json({ success: false, error: 'Buono not found in utente mobile buoni.' });
                    }

                    return res.status(200).json({ success: true, buoni: buonoUtente });
                })
                .catch((error) => {
                    console.error('utente non trovato con l\'ID specificato', error);
                    return res.status(404).json({ success: false, error: 'Utente non trovato con l\'ID specificato' });
                });
        })
        .catch((error) => {
            console.error('Buono non trovato con l\'ID specificato', error);
            return res.status(404).json({ success: false, error: 'Buono non trovato con l\'ID specificato' });
        });
});


module.exports = router;