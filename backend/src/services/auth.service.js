const bcrypt = require('bcryptjs');
const User = require('../models/User');
const AppError = require('../utils/AppError');
const { signToken } = require('../utils/jwt');

const SALT_ROUNDS = 10;

const publicUser = (user) => ({ id: user._id, name: user.name, email: user.email, createdAt: user.createdAt });

async function register({ name, email, password }) {
  const normalizedEmail = email.trim().toLowerCase();

  const exists = await User.exists({ email: normalizedEmail });
  if (exists) throw AppError.badRequest('Ese correo ya está registrado', [{ field: 'email', message: 'Ese correo ya está registrado' }]);

  // bcrypt genera una sal aleatoria y guarda el hash: la contraseña nunca se almacena en texto plano.
  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
  const user = await User.create({ name: name.trim(), email: normalizedEmail, passwordHash });

  return { user: publicUser(user), token: signToken(user) };
}

async function login({ email, password }) {
  // +passwordHash: lo pedimos explícitamente porque en el modelo tiene select: false
  const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+passwordHash');

  // Mismo mensaje si el correo no existe o si la contraseña no coincide (no revelamos cuál falló).
  const valid = user && (await bcrypt.compare(password, user.passwordHash));
  if (!valid) throw AppError.unauthorized('Correo o contraseña incorrectos');

  return { user: publicUser(user), token: signToken(user) };
}

function me(user) {
  return publicUser(user);
}

module.exports = { register, login, me };
