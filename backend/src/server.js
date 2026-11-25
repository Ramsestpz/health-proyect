const app = require('./app');
const connectDB = require('./config/db');
const { port } = require('./config/env');

async function start() {
  try {
    await connectDB();
    app.listen(port, () => console.log(`API de SaludCerca León escuchando en el puerto ${port}`));
  } catch (error) {
    console.error('No se pudo iniciar el servidor:', error.message);
    process.exit(1);
  }
}

start();
