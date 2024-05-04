const mongoose = require("mongoose")

const segnalazioneSchema = new mongoose.Schema({
    luogo: Number,
    foto: String,  //TODO: verify how to actually store an image
    tipo: { type: String, enum: ["strada", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche"] },
    urgenza: { type: String, enum: ["bassa", "medio-bassa", "medio-alta", "alta"] },
    status: { type: String, enum: ["aperta", "presa_in_carico", "conclusa"] }
});

module.exports = mongoose.model("Segnalazione", segnalazioneSchema);
