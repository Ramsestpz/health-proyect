const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { clientUrls, nodeEnv } = require('./config/env');
const routes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

// Solo el frontend configurado en CLIENT_URL puede consumir la API desde el navegador.
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || clientUrls.includes(origin)) return callback(null, true);
      return callback(null, false);
    },
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(morgan(nodeEnv === 'production' ? 'tiny' : 'dev'));

// Ruta de salud: útil para Render y para comprobar que la API está arriba
app.get('/', (req, res) => {
  res.status(200).json({ ok: true, name: 'SaludCerca León API', docs: '/api' });
});
app.get('/api', (req, res) => {
  res.status(200).json({
    ok: true,
    endpoints: ['/api/auth', '/api/categories', '/api/specialties', '/api/doctors', '/api/locations', '/api/zones'],
  });
});

app.use('/api', routes);

// Siempre al final: 404 de rutas inexistentes y manejador central de errores
app.use(notFound);
app.use(errorHandler);

module.exports = app;
