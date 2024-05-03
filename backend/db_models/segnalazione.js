const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports= mongoose.model("segnalazione", new Schema({
    id: Schema.Types.ObjectId,
    luogo: Number, 
    foto: String,  /*TODO: verify how to actually store an image*/
    tipo: ["strada", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche"],
    urgenza: ["bassa", "medio-bassa", "medio-alta", "alta"],
    status: ["aperta", "presa_in_carico", "conclusa"]
}));