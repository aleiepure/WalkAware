const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports("azienda", new Schema({
    id: Schema.Types.ObjectId, 
    nome: String, 
    P_IVA: Number, 
    email: String, 
    password: String
}))