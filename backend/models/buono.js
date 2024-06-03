const mongoose = require("mongoose");

const buonoSchema = new mongoose.Schema({
    id_utente: {type: String, required:true},
    id_buono: {type: String, required:true},
    nome: { type: String, required: true },
    valore: { type: Number, required: true },
    tipo: { type: String, enum: ["percentuale", "contante", "omaggio", "quantita"] },
    descrizione: { type: String, required: true },
    costo_punti: { type: Number, required: true },
    idAzienda: { type: String, required: true },
    validitaBuono: { type: Number, required: true },  // Numero di giorni di validità del buono
    data_riscatto: { type: Date, default: Date.now },
    usato: { type: Boolean, default: false },
});

module.exports = mongoose.model("buono", buonoSchema);

