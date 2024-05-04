const mongoose = require("mongoose");

const buonoSchema = new mongoose.Schema({
    id_premio: { type: String },
    data_riscatto: { type: Date, default: Date.now },
    validita: Date,
    usato: Boolean
});

const segnalazioneSchema = new mongoose.Schema({
    luogo: Number,
    foto: String,  //TODO: verify how to actually store an image
    tipo: { type: String, enum: ["strada", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche"] },
    urgenza: { type: String, enum: ["bassa", "medio-bassa", "medio-alta", "alta"] },
    status: { type: String, enum: ["aperta", "presa_in_carico", "conclusa"] }
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
