const mongoose = require("mongoose")

const immagineSchema = new mongoose.Schema({
    immagine: { data: Buffer, contentType: String}
});

module.exports = mongoose.model("immagine", immagineSchema);
