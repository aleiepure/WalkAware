const express = require('express');
const buonoModel = require('../models/buono');
const { utenteMobileModel } = require('../models/utente_mobile.js');

const router = express.Router();

router.put("/:id/valida", async (req, res) => {
    buonoModel.findById(req.params.id)
        .then((result) => {
            let today = new Date();
            let buonoDate = new Date(result.data_riscatto); //date
            let validita = result.validitaBuono; //int in days

            let compareDate = new Date(buonoDate);
            compareDate.setDate(buonoDate.getDate() + validita);

            if (compareDate.getTime() >= today.getTime() && result.usato === false) {
                result.usato = true;
                result.save();
                console.log("Arrivo a salvare");
                return res.json({ success: true, usato: result.usato });
            } else if (result.usato == true) {
                console.error("Buono già utilizzato");
                return res.status(400).json({ success: false, error: "Buono già utilizzato" });
            } else if (compareDate < today) {
                console.error("Buono scaduto");
                return res.status(400).json({ success: false, error: "Buono scaduto" });
            }
        })
        .catch((error) => {
            console.error('Buono non trovato con l\'ID specificato', error);
            return res.status(404).json({ success: false, error:'Buono non trovato con l\'ID specificato' });
        });

});

router.get("/:id", async (req, res) => {
    buonoModel.findById(req.params.id)
        .then((result)=>{
            return res.status(200).json({ success: true, buoni: result });
        })
        .catch((error) => {
			console.error('Buono non trovato con l\'ID specificato', error);
			return res.status(404).json({ success: false, error: 'Buono non trovato con l\'ID specificato' });
		});
});


module.exports = router;