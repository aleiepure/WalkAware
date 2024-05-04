const mongoose = require("mongoose");

const utenteWebSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    supporto_tecnico: {type: Boolean, default: false},
});

module.exports = mongoose.model("utente_web", utenteWebSchema);
