const mongoose = require("mongoose")

const immagineSchema = new mongoose.Schema({
    foto: { type: String, required: true }
});

module.exports = mongoose.model("immagine", immagineSchema);
