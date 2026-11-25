// Carga y centraliza las variables de entorno (.env).
// Ningún otro archivo lee process.env directamente: todo pasa por aquí.
require('dotenv').config({ quiet: true });

const required = ['MONGODB_URI', 'JWT_SECRET'];
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`Faltan variables de entorno: ${missing.join(', ')}. Revisa tu archivo .env (usa .env.example como guía).`);
  process.exit(1);
}

module.exports = {
  port: Number(process.env.PORT) || 4000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '8h',
  // Puede ser una lista separada por comas: http://localhost:5173,https://mi-app.vercel.app
  clientUrls: (process.env.CLIENT_URL || 'http://localhost:5173')
    .split(',')
    .map((url) => url.trim().replace(/\/$/, ''))
    .filter(Boolean),
  nodeEnv: process.env.NODE_ENV || 'development',
};
