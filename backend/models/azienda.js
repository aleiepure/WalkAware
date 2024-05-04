const mongoose = require("mongoose")

const aziendaSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    p_iva: { type: Number, required: true },
    email: { type: String, required: true },
    password: { type: String, required: true }
});

module.exports = mongoose.model("azienda", aziendaSchema);
