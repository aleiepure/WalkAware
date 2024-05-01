const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = mongoose.model("utente_mobile", new Schema({
    id: Schema.Types.ObjectId, 
    nome: String, 
    eta: Number, 
    email: String, 
    password: String,
    punti: Number, 
    buoni:[{
        id: Schema.Types.ObjectId,
        id_premio: {type: Schema.Types.ObjectId, ref:"premio"},
        data_riscatto: Schema.Types.Date, 
        validita: Schema.Types.Date, 
        usato: Boolean
    }], 
    segnalazioni:[{type: Schema.Types.ObjectId, ref:"segnalazioni"}]

}))

