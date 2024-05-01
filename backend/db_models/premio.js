const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports("premio", new Schema({
    id: Schema.Types.ObjectId, 
    nome: String, 
    valore: Number, 
    tipo: ["percentuale", "contante", "omaggio", "quantità"], 
    descrizione: String, 
    costo_punti: Number, 
    azienda: {type: Schema.Types.ObjectId, ref:"azienda"}
}))