const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = mongoose.model("utente_web", new Schema({
    id: Number, 
    nome: String, 
    email: String, 
    password: String

}))