const mongoose = require("mongoose");

const buonoSchema = new mongoose.Schema({
    id_premio: { type: String },
    data_riscatto: { type: Date, default: Date.now },
    validita: { type: Date },
    usato: { type: Boolean, default: false },
});

const segnalazioneSchema = new mongoose.Schema({
    luogo: String, //{ type: String, required: true }, // Formato "latitudine,longitudine"
    foto: String, //{ type: String },  //TODO: verify how to actually store an image
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

module.exports = mongoose.model("UtenteMobile", utenteMobileSchema);
