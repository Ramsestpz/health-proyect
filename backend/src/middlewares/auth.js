const AppError = require('../utils/AppError');
const { verifyToken } = require('../utils/jwt');
const User = require('../models/User');

// Protege las rutas internas: exige el header "Authorization: Bearer <token>".
async function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    throw AppError.unauthorized('Debes iniciar sesión para continuar');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw AppError.unauthorized('Tu sesión expiró o no es válida. Inicia sesión de nuevo');
  }

  const user = await User.findById(payload.sub);
  if (!user) throw AppError.unauthorized('El usuario de la sesión ya no existe');

  req.user = user; // disponible para los servicios (ej. createdBy)
  next();
}

module.exports = requireAuth;
