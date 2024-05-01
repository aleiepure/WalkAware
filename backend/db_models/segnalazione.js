const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports("segnalazione", new Schema({
    luogo: Number, 
    foto: String,  /*TODO: verify how to actually store an image*/
    tipo: ["strada", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche"],
    urgenza: ["bassa", "medio-bassa", "medio-alta", "alta"],
    status: ["aperta", "presa_in_carico", "conclusa"]
}))