const { isValidObjectId } = require('mongoose');
const AppError = require('../utils/AppError');
const { isValidLngLat } = require('../utils/geo');

// ---------------------------------------------------------------------------
// Middleware de validación de datos.
// Cada validador recibe el body y regresa una lista de errores { field, message }.
// Si hay errores, se corta la petición con un 400 antes de llegar al servicio.
// ---------------------------------------------------------------------------

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const isBlank = (value) => value === undefined || value === null || String(value).trim() === '';

// Pequeño "constructor" de reglas para que cada validador se lea fácil.
function checker(body) {
  const errors = [];
  const add = (field, message) => errors.push({ field, message });

  const api = {
    errors,
    required(field, label) {
      if (isBlank(body[field])) add(field, `${label} es obligatorio`);
      return api;
    },
    maxLength(field, label, max) {
      if (!isBlank(body[field]) && String(body[field]).trim().length > max) add(field, `${label} admite máximo ${max} caracteres`);
      return api;
    },
    minLength(field, label, min) {
      if (!isBlank(body[field]) && String(body[field]).length < min) add(field, `${label} debe tener al menos ${min} caracteres`);
      return api;
    },
    email(field) {
      if (!isBlank(body[field]) && !EMAIL_RE.test(String(body[field]).trim())) add(field, 'El correo no tiene un formato válido');
      return api;
    },
    objectId(field, label) {
      if (!isBlank(body[field]) && !isValidObjectId(body[field])) add(field, `${label} no es un identificador válido`);
      return api;
    },
    oneOf(field, label, options) {
      if (!isBlank(body[field]) && !options.includes(body[field])) add(field, `${label} debe ser: ${options.join(', ')}`);
      return api;
    },
    hexColor(field) {
      if (!isBlank(body[field]) && !HEX_RE.test(body[field])) add(field, 'El color debe tener formato #RRGGBB');
      return api;
    },
    boolean(field, label) {
      if (body[field] !== undefined && typeof body[field] !== 'boolean') add(field, `${label} debe ser verdadero o falso`);
      return api;
    },
  };
  return api;
}

// Fábrica de middleware: validate(validador) → (req, res, next)
const validate = (validator) => (req, res, next) => {
  const errors = validator(req.body || {});
  if (errors.length > 0) {
    throw AppError.badRequest('Revisa los datos enviados', errors);
  }
  next();
};

// ----------------------------- Validadores ---------------------------------

const registerRules = (b) =>
  checker(b)
    .required('name', 'El nombre').maxLength('name', 'El nombre', 80)
    .required('email', 'El correo').email('email')
    .required('password', 'La contraseña').minLength('password', 'La contraseña', 8)
    .errors;

const loginRules = (b) => checker(b).required('email', 'El correo').email('email').required('password', 'La contraseña').errors;

const categoryRules = (b) =>
  checker(b)
    .required('name', 'El nombre').maxLength('name', 'El nombre', 60)
    .maxLength('description', 'La descripción', 300)
    .hexColor('color')
    .maxLength('icon', 'El ícono', 4)
    .errors;

const specialtyRules = (b) =>
  checker(b).required('name', 'El nombre').maxLength('name', 'El nombre', 60).maxLength('description', 'La descripción', 300).errors;

const doctorRules = (b) =>
  checker(b)
    .required('fullName', 'El nombre').maxLength('fullName', 'El nombre', 100)
    .required('licenseNumber', 'La cédula profesional').maxLength('licenseNumber', 'La cédula', 20)
    .required('specialty', 'La especialidad').objectId('specialty', 'La especialidad')
    .required('location', 'El establecimiento').objectId('location', 'El establecimiento')
    .maxLength('phone', 'El teléfono', 20)
    .oneOf('shift', 'El turno', ['Matutino', 'Vespertino', 'Nocturno', 'Mixto'])
    .errors;

const locationRules = (b) => {
  const errors = checker(b)
    .required('name', 'El nombre').maxLength('name', 'El nombre', 100)
    .maxLength('description', 'La descripción', 500)
    .required('category', 'La categoría').objectId('category', 'La categoría')
    .maxLength('address', 'La dirección', 200)
    .maxLength('phone', 'El teléfono', 20)
    .oneOf('status', 'El estado', ['Disponible', 'Saturado', 'Cerrado'])
    .boolean('open24h', '24 horas')
    .errors;
  if (!isValidLngLat(b.coordinates)) {
    errors.push({ field: 'coordinates', message: 'Las coordenadas deben ser [longitud, latitud] válidas' });
  }
  return errors;
};

const zoneRules = (b) => {
  const errors = checker(b)
    .required('name', 'El nombre de la zona').maxLength('name', 'El nombre', 80)
    .maxLength('description', 'La descripción', 300)
    .oneOf('type', 'El tipo', ['Cobertura', 'Riesgo sanitario', 'Campaña de salud', 'Otra'])
    .hexColor('color')
    .errors;
  // coordinates es opcional al editar (solo nombre/color), pero si viene debe ser un anillo válido
  if (b.coordinates !== undefined) {
    const ring = Array.isArray(b.coordinates) ? b.coordinates[0] : null;
    if (!Array.isArray(ring) || ring.length < 3 || !ring.every(isValidLngLat)) {
      errors.push({ field: 'coordinates', message: 'El polígono necesita al menos 3 vértices [longitud, latitud]' });
    }
  }
  return errors;
};

const zoneCreateRules = (b) => {
  const errors = zoneRules(b);
  if (b.coordinates === undefined) errors.push({ field: 'coordinates', message: 'Faltan los vértices de la zona' });
  return errors;
};

module.exports = {
  validate,
  registerRules,
  loginRules,
  categoryRules,
  specialtyRules,
  doctorRules,
  locationRules,
  zoneRules,
  zoneCreateRules,
};
