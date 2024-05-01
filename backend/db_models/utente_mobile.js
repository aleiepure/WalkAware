const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const utenteMobileSchema = new Schema({
    nome: String,
    eta: Number,
    email: { type: String, required: true, unique: true }, // Email obbligatoria e unica
    password: { type: String, required: true }, // Password obbligatoria
    punti: Number,
    buoni: [{
        id_premio: Number,
        data_riscatto: { type: Date, default: Date.now },
        validita: Date,
        usato: Boolean
    }],
    segnalazioni: [{
        tipo: { type: String, enum: ["strada", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche"] },
        urgenza: { type: String, enum: ["bassa", "medio-bassa", "medio-alta", "alta"] },
        status: { type: String, enum: ["aperta", "presa_in_carico", "conclusa"] }
    }]
});

module.exports = mongoose.model("UtenteMobile", utenteMobileSchema);

