const mongoose = require('mongoose');
const AppError = require('../utils/AppError');
const { nodeEnv } = require('../config/env');

// Traduce errores conocidos (Mongoose, MongoDB, JSON) a AppError con su código HTTP.
function normalizeError(err) {
  if (err instanceof AppError) return err;

  if (err instanceof mongoose.Error.ValidationError) {
    const details = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return AppError.badRequest('Revisa los datos enviados', details);
  }

  if (err instanceof mongoose.Error.CastError) {
    return AppError.badRequest(`Valor inválido para ${err.path}`);
  }

  // Índice único violado (correo, nombre de categoría, cédula repetidos)
  if (err.code === 11000) {
    const field = Object.keys(err.keyValue || {})[0] || 'campo';
    const labels = { email: 'Ese correo ya está registrado', name: 'Ya existe un registro con ese nombre', licenseNumber: 'Ya existe un médico con esa cédula' };
    return AppError.badRequest(labels[field] || `El valor de ${field} ya existe`, [{ field, message: labels[field] || 'Duplicado' }]);
  }

  // MongoDB no pudo indexar la geometría (ej. polígono cuyos lados se cruzan)
  if (err.code === 16755) {
    return AppError.badRequest('La geometría no es válida: revisa que los lados del polígono no se crucen');
  }

  // JSON mal formado en el body
  if (err.type === 'entity.parse.failed') {
    return AppError.badRequest('El cuerpo de la petición no es un JSON válido');
  }

  return new AppError('Ocurrió un error interno en el servidor', 500);
}

// Manejador centralizado: todas las respuestas de error tienen la misma forma.
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  const appError = normalizeError(err);

  if (appError.statusCode >= 500) console.error(err);

  res.status(appError.statusCode).json({
    ok: false,
    status: appError.statusCode,
    message: appError.message,
    ...(appError.details ? { errors: appError.details } : {}),
    ...(nodeEnv === 'development' && appError.statusCode >= 500 ? { stack: err.stack } : {}),
  });
}

module.exports = errorHandler;
