const mongoose = require("mongoose")

const premioSchema = new mongoose.Schema({
    nome: { type: String, required: true },
    valore: { type: Number, required: true },
    tipo: { type: String, enum: ["percentuale", "contante", "omaggio", "quantità"] },
    descrizione: { type: String, required: true },
    costo_punti: { type: Number, required: true },
    idAzienda: { type: String, required: true },
    validitaBuono: { type: Number, required: true },  // Numero di giorni di validità del buono
});

module.exports = mongoose.model("premio", premioSchema);
