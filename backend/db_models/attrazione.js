const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports("attrazione", new Schema({
    nome: String, 
    descrizione: String, 
    data_inizio: Schema.Types.Date, 
    data_fine: Schema.Types.Date
}))

