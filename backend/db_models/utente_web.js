const mongoose = require("mongoose");

const Schema = mongoose.Schema;

module.exports = mongoose.model("utente_web", new Schema({
    id: Schema.Types.ObjectId, 
    nome: String, 
    email: String, 
    password: String
}))