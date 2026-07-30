const express = require('express');
const cors = require('cors');
const apiRoutes = require('./routes/api');
require('dotenv').config();

const app = express();

// Middlewares
// Middlewares
app.use(cors({
    origin: ['http://localhost:5173', 'https://israwolf16.github.io'],
    methods: ['GET', 'POST', 'DELETE', 'PATCH', 'OPTIONS']
}));
app.use(express.json());

// Rutas
app.use('/api', apiRoutes);

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Servidor de Mechanic App corriendo en http://localhost:${PORT}`);
});
