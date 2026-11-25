const { isValidObjectId } = require('mongoose');
const AppError = require('../utils/AppError');

// Valida que :id sea un ObjectId antes de consultar MongoDB (evita CastError → 400 claro).
function validateId(req, res, next) {
  if (!isValidObjectId(req.params.id)) {
    throw AppError.badRequest('El identificador enviado no es válido');
  }
  next();
}

module.exports = validateId;
