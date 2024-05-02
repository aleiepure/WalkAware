const mongoose = require("mongoose")
const Schema = mongoose.Schema

module.exports("azienda", new Schema({
    nome: String, 
    P_IVA: Number, 
    email: String, 
    password: String
}))