const mongoose = require("mongoose")

const attrazioneSchema = new mongoose.Schema({
    nome: {type: String, required: true}, 
    descrizione: {type: String, required: true}, 
    data_inizio: {type: Date, default: null}, 
    data_fine: {type: Date, default: null},
    luogo: { type: String, required: true }, // Formato "latitudine,longitudine"
});

module.exports = mongoose.model("attrazione", attrazioneSchema);
