const Zone = require('../models/Zone');
const Location = require('../models/Location');
const AppError = require('../utils/AppError');
const { closeRing } = require('../utils/geo');

// Construye el GeoJSON Polygon a partir del anillo [[lng, lat], ...] enviado por el cliente.
function toPolygon(coordinates) {
  const ring = coordinates[0].map(([lng, lat]) => [Number(lng), Number(lat)]);
  return { type: 'Polygon', coordinates: [closeRing(ring)] };
}

async function list() {
  const zones = await Zone.find().populate('createdBy', 'name').sort({ createdAt: 1 }).lean();
  // Para cada zona contamos cuántos establecimientos quedan dentro ($geoWithin)
  return Promise.all(
    zones.map(async (zone) => ({
      ...zone,
      locationsCount: await Location.countDocuments({ geometry: { $geoWithin: { $geometry: zone.geometry } } }),
    }))
  );
}

async function create({ name, description, type, color, coordinates }, user) {
  const zone = await Zone.create({ name, description, type, color, geometry: toPolygon(coordinates), createdBy: user._id });
  return zone.populate('createdBy', 'name');
}

async function update(id, { name, description, type, color, coordinates }) {
  const changes = { name, description, type, color };
  if (coordinates) changes.geometry = toPolygon(coordinates);
  const zone = await Zone.findByIdAndUpdate(id, changes, { returnDocument: 'after', runValidators: true }).populate('createdBy', 'name');
  if (!zone) throw AppError.notFound('La zona no existe');
  return zone;
}

async function remove(id) {
  const zone = await Zone.findByIdAndDelete(id);
  if (!zone) throw AppError.notFound('La zona no existe');
  return zone;
}

module.exports = { list, create, update, remove };
