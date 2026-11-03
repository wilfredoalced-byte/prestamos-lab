const express = require('express');
const cors = require('cors');

const app = express();

// MIDDLEWARES GLOBALES (se ejecutan antes de cada ruta)
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' })); // qué páginas web pueden consumir la API
app.use(express.json()); // permite leer cuerpos JSON en las peticiones

// Ruta de prueba para saber si la API está viva
app.get('/api/salud', (req, res) => {
  res.json({ estado: 'ok', mensaje: 'API de préstamos funcionando' });
});

// RUTAS DE LA API
// (las iremos agregando aquí)
app.use('/api/auth', require('./routes/auth.routes'));
// Ruta no encontrada → 404
app.use((req, res) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.originalUrl}` });
});

// MANEJO DE ERRORES (siempre responde en JSON)
app.use((err, req, res, next) => {
  // JSON mal escrito en el cuerpo de la petición
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'El cuerpo de la petición no es un JSON válido' });
  }
  // Valor repetido (correo o código de equipo duplicado)
  if (err.name === 'SequelizeUniqueConstraintError') {
    const campo = Object.keys(err.fields || {})[0] || 'campo';
    return res.status(409).json({ error: `Ya existe un registro con ese ${campo}` });

  }
  // Datos que no cumplen las reglas del modelo
  if (err.name === 'SequelizeValidationError') {
    return res.status(400).json({ error: err.errors.map((e) => e.message).join(', ') });
  }
  // Intento de borrar algo que tiene registros relacionados
  if (err.name === 'SequelizeForeignKeyConstraintError') {
    return res.status(409).json({ error: 'La operación no está permitida porque hay registros relacionados' });
  }
  console.error(err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

module.exports = app;