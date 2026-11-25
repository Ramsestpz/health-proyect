const { isValidObjectId, Types } = require('mongoose');
const Location = require('../models/Location');
const Category = require('../models/Category');
const Doctor = require('../models/Doctor');
const Zone = require('../models/Zone');
const AppError = require('../utils/AppError');
const { escapeRegex } = require('../utils/geo');

const STATUSES = ['Disponible', 'Saturado', 'Cerrado'];

// Convierte el body del cliente al formato del modelo (GeoJSON Point [lng, lat])
function toDocument({ name, description, category, coordinates, address, phone, status, open24h }) {
  return {
    name,
    description,
    category,
    address,
    phone,
    status,
    open24h,
    geometry: { type: 'Point', coordinates: [Number(coordinates[0]), Number(coordinates[1])] },
  };
}

const withRelations = (query) => query.populate('category', 'name color icon').populate('createdBy', 'name');

async function assertCategory(categoryId) {
  const exists = await Category.exists({ _id: categoryId });
  if (!exists) throw AppError.badRequest('La categoría seleccionada no existe');
}

/**
 * Lista ubicaciones aplicando los filtros recibidos por query string:
 *   ?search=texto   → nombre que contenga el texto (sin importar mayúsculas)
 *   ?category=id    → por categoría
 *   ?status=valor   → Disponible | Saturado | Cerrado
 *   ?zone=id        → solo las que caen dentro del polígono de esa zona ($geoWithin)
 *   ?open24h=true   → solo las que abren 24 horas
 */
async function list({ search, category, status, zone, open24h } = {}) {
  const filter = {};

  if (search && search.trim()) {
    filter.name = { $regex: escapeRegex(search.trim()), $options: 'i' };
  }

  if (category) {
    if (!isValidObjectId(category)) throw AppError.badRequest('La categoría del filtro no es válida');
    filter.category = category;
  }

  if (status) {
    if (!STATUSES.includes(status)) throw AppError.badRequest(`El estado debe ser: ${STATUSES.join(', ')}`);
    filter.status = status;
  }

  if (open24h === 'true') filter.open24h = true;

  if (zone) {
    if (!isValidObjectId(zone)) throw AppError.badRequest('La zona del filtro no es válida');
    const zoneDoc = await Zone.findById(zone).lean();
    if (!zoneDoc) throw AppError.notFound('La zona seleccionada no existe');
    // Consulta geoespacial: puntos que están dentro del polígono (usa el índice 2dsphere)
    filter.geometry = { $geoWithin: { $geometry: zoneDoc.geometry } };
  }

  return withRelations(Location.find(filter).sort({ createdAt: -1 }));
}

async function getById(id) {
  const location = await withRelations(Location.findById(id));
  if (!location) throw AppError.notFound('La ubicación no existe');
  return location;
}

async function create(data, user) {
  await assertCategory(data.category);
  const location = await Location.create({ ...toDocument(data), createdBy: user._id });
  return getById(location._id);
}

async function update(id, data) {
  await assertCategory(data.category);
  const location = await Location.findByIdAndUpdate(id, toDocument(data), { returnDocument: 'after', runValidators: true });
  if (!location) throw AppError.notFound('La ubicación no existe');
  return getById(location._id);
}

// Al borrar un establecimiento también se borran los médicos asignados a él.
async function remove(id) {
  const location = await Location.findByIdAndDelete(id);
  if (!location) throw AppError.notFound('La ubicación no existe');
  const { deletedCount } = await Doctor.deleteMany({ location: id });
  return { location, deletedDoctors: deletedCount };
}

/**
 * Establecimientos más cercanos a un punto, ordenados por distancia.
 * Usa la etapa $geoNear (requiere el índice 2dsphere) y devuelve la distancia en metros.
 */
async function nearby({ lng, lat, maxDistance = 5000, category, limit = 10, onlyAvailable }) {
  const point = [Number(lng), Number(lat)];
  if (!point.every(Number.isFinite) || Math.abs(point[0]) > 180 || Math.abs(point[1]) > 90) {
    throw AppError.badRequest('Envía lng y lat válidos en la consulta (?lng=-101.68&lat=21.12)');
  }

  const query = {};
  if (category) {
    if (!isValidObjectId(category)) throw AppError.badRequest('La categoría del filtro no es válida');
    // En aggregate no hay conversión automática: convertimos el texto a ObjectId
    query.category = new Types.ObjectId(category);
  }
  if (onlyAvailable === 'true') query.status = { $ne: 'Cerrado' };

  const results = await Location.aggregate([
    {
      $geoNear: {
        near: { type: 'Point', coordinates: point },
        distanceField: 'distance',
        maxDistance: Math.min(Number(maxDistance) || 5000, 50000),
        spherical: true,
        query,
      },
    },
    { $limit: Math.min(Number(limit) || 10, 50) },
  ]);

  return Location.populate(results, [
    { path: 'category', select: 'name color icon' },
    { path: 'createdBy', select: 'name' },
  ]);
}

module.exports = { list, getById, create, update, remove, nearby };
