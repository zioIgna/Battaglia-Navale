const mongoose = require('mongoose');

const msgSchema = mongoose.Schema({
    autore: { type: String, required: true },
    contenuto: { type: String, required: true },
    destinatario: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', msgSchema);