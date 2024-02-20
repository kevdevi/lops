const mongoose = require('mongoose');

// Define el esquema para un ticket
const TicketSchema = new mongoose.Schema({
    id: {
        type: String, // Cambia esto a String
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    time: {
        type: String,
        required: true
    }
});

// Crea el modelo Ticket a partir del esquema
const Ticket = mongoose.model('Ticket', TicketSchema);

// Exporta el modelo Ticket para que pueda ser importado en otros archivos
module.exports = Ticket;