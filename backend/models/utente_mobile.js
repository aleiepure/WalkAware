const mongoose = require("mongoose");

const buonoSchema = new mongoose.Schema({
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

const segnalazioneSchema = new mongoose.Schema({
    luogo: { type: String, required: true }, // Formato "latitudine,longitudine"
    foto: { type: String },
    tipo: { type: String, enum: ["strada", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche", "rifiuti", "parcheggi", "altro"] },
    urgenza: { type: String, enum: ["bassa", "medio-bassa", "medio-alta", "alta"] },
    status: { type: String, enum: ["aperta", "presa_in_carico", "conclusa"], default: "aperta"},
    data: { type: Date, default: Date.now }
});

const utenteMobileSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    eta: { type: Number, min: 18, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    punti: { type: Number, default: 0 },
    buoni: [buonoSchema],
    segnalazioni: [segnalazioneSchema],
});

module.exports.utenteMobileModel = mongoose.model("UtenteMobile", utenteMobileSchema);
module.exports.segnalazioneUtenteMobileModel = mongoose.model("SegnalazioneUtenteMobile", segnalazioneSchema);
module.exports.buonoModel = mongoose.model("Buono", buonoSchema);