const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = mongoose.model("utente_mobile", new Schema({
    id: Number, 
    nome: String, 
    eta: Number, 
    email: String, 
    password: String,
    punti: Number, 
    buoni:{
        id: Number,
        id_premio: Number,
        data_riscatto: Schema.Types.Date, 
        validita: Schema.Types.Date, 
        usato: Boolean
    }, 
    segnalazioni:{
        id: Number, 
        luogo: GeolocationCoordinates, 
        foto: File, 
        tipo: ["strada", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche"],
        urgenza: ["bassa", "medio-bassa", "medio-alta", "alta"],
        status: ["aperta", "presa_in_carico", "conclusa"]
    }

}))

