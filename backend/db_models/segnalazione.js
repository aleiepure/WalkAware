const { ObjectId } = require("mongodb");
const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports= mongoose.model("segnalazione", new Schema({
    id: Schema.Types.ObjectId,
    luogo: Number, 
    foto: Schema.Types.ObjectId,  /*TODO: verify how to actually store an image*/
    tipo: {type: String, enum:["strada", "illuminazione", "segnaletica", "sicurezza", "barriereArchitettoniche"]},
    urgenza: {type: String, enum:["bassa", "medio-bassa", "medio-alta", "alta"]},
    status: {type: String, enum: ["aperta", "presa_in_carico", "conclusa"]}
}));