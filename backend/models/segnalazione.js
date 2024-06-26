const mongoose = require("mongoose")

const segnalazioneSchema = new mongoose.Schema({
    id_utente: { type: String, required: true },
    id_segnalazione: { type: String, required: true },
    luogo: { type: String, required: true }, // Formato "latitudine,longitudine"
    foto: { type: String },
    tipo: { type: String, enum: ["viabilita", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche", "rifiuti", "parcheggi", "altro"] },
    urgenza: { type: String, enum: ["bassa", "medio-bassa", "medio-alta", "alta"] },
    status: { type: String, enum: ["aperta", "presa_in_carico", "conclusa"], default: "aperta" },
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Segnalazione", segnalazioneSchema);
