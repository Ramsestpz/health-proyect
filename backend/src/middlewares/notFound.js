const AppError = require('../utils/AppError');

// Se ejecuta cuando ninguna ruta coincidió → 404.
function notFound(req, res, next) {
  next(AppError.notFound(`La ruta ${req.method} ${req.originalUrl} no existe`));
}

module.exports = notFound;
