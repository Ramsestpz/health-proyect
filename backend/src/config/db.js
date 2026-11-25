const mongoose = require('mongoose');
const { mongoUri } = require('./env');

// Conecta con MongoDB Atlas usando la cadena del .env.
async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(mongoUri);
  console.log(`MongoDB conectado: ${mongoose.connection.host}/${mongoose.connection.name}`);
}

module.exports = connectDB;
