// Importa los módulos necesarios
const express = require('express');
const mongoose = require('mongoose');
const Ticket = require('./models/Ticket');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');

// Conéctate a MongoDB
mongoose.connect('mongodb+srv://kevin:tmy9dO3F6NuBxgIi@cluster0.hn1j2o7.mongodb.net/ticket')
    .then(() => console.log('Conexión a MongoDB exitosa'))
    .catch((error) => console.error('Error conectando a MongoDB:', error));

// Crea una nueva aplicación Express
const app = express();
app.use(express.json());
app.use(cors({
  origin: 'http://192.168.0.15:3001' // Permite solicitudes desde este origen
}));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: 'http://192.168.0.15:3001', // Permite solicitudes desde este origen
    methods: ["GET", "POST"] // Permite los métodos GET y POST
  }
});

// Define una ruta GET para obtener todos los tickets
app.get('/tickets', async (req, res) => {
    try {
        const tickets = await Ticket.find();
        res.json(tickets);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Define una ruta POST para crear un nuevo ticket
app.post('/tickets', async (req, res) => {
    try {
        const tickets = req.body;
        const result = await Ticket.insertMany(tickets);
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Define una ruta PUT para actualizar un ticket existente
app.put('/tickets/:index', async (req, res) => {
    const tickets = await Ticket.find();
    const index = req.params.index;
    if (index < 0 || index >= tickets.length) return res.status(404).send('Ticket no encontrado');
    const ticket = tickets[index];
    ticket.set(req.body);
    const result = await ticket.save();
    io.emit('ticketAttended', index); // Emite el evento 'ticketAttended' cuando un ticket es atendido
    res.send(result);
});

// Define una ruta DELETE para eliminar todos los tickets
app.delete('/tickets', async (req, res) => {
    const result = await Ticket.deleteMany({});
    io.emit('allTicketsDeleted');
    res.send(result);
});

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('ticketSelected', (index) => {
        console.log('ticketSelected', index);
        socket.broadcast.emit('ticketSelected', index); // Emite el evento a todos los demás clientes
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
        io.emit('userDisconnected'); // Emite un evento cuando un usuario se desconecta
    });

    socket.on('reconnect', () => {
        console.log('user reconnected');
        io.emit('userReconnected'); // Emite un evento cuando un usuario se reconecta
    });
});

// Inicia el servidor en el puerto 3000
server.listen(3000, () => console.log('Server listening on port 3000'));