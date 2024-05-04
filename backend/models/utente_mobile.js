const mongoose = require("mongoose");

const buonoSchema = new mongoose.Schema({
    id_premio: { type: String },
    data_riscatto: { type: Date, default: Date.now },
    validita: { type: Date },
    usato: { type: Boolean, default: false },
});

const segnalazioneSchema = new mongoose.Schema({
    luogo: { type: String, required: true }, // Formato "latitudine,longitudine"
    urlFoto: { type: String, required: true },
    tipo: { type: String, enum: ["strada", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche"] },
    urgenza: { type: String, enum: ["bassa", "medio-bassa", "medio-alta", "alta"] },
    status: { type: String, enum: ["aperta", "presa_in_carico", "conclusa"] },
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