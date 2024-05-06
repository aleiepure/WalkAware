const mongoose = require("mongoose")
const Schema = mongoose.Schema


const segnalazioneSchema = new mongoose.Schema({
    id: { type: String, required: true},
    luogo: { type: String, required: true }, // Formato "latitudine,longitudine"
    urlFoto: { type: String, required: true },
    tipo: { type: String, enum: ["strada", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche"] },
    urgenza: { type: String, enum: ["bassa", "medio-bassa", "medio-alta", "alta"] },
    status: { type: String, enum: ["aperta", "presa_in_carico", "conclusa"] },
    data: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Segnalazione", segnalazioneSchema);