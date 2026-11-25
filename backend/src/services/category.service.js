const Category = require('../models/Category');
const Location = require('../models/Location');
const AppError = require('../utils/AppError');

const pick = ({ name, description, color, icon }) => ({ name, description, color, icon });

async function list() {
  const categories = await Category.find().sort({ name: 1 }).lean();
  // Cuántas ubicaciones usa cada categoría (útil para la vista de catálogos)
  const counts = await Location.aggregate([{ $group: { _id: '$category', total: { $sum: 1 } } }]);
  const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.total]));
  return categories.map((c) => ({ ...c, locationsCount: byId[String(c._id)] || 0 }));
}

async function getById(id) {
  const category = await Category.findById(id);
  if (!category) throw AppError.notFound('La categoría no existe');
  return category;
}

async function create(data, user) {
  return Category.create({ ...pick(data), createdBy: user._id });
}

async function update(id, data) {
  const category = await Category.findByIdAndUpdate(id, pick(data), { returnDocument: 'after', runValidators: true });
  if (!category) throw AppError.notFound('La categoría no existe');
  return category;
}

async function remove(id) {
  const inUse = await Location.countDocuments({ category: id });
  if (inUse > 0) {
    throw AppError.badRequest(`No se puede eliminar: ${inUse} ubicación(es) usan esta categoría. Cámbialas primero.`);
  }
  const category = await Category.findByIdAndDelete(id);
  if (!category) throw AppError.notFound('La categoría no existe');
  return category;
}

module.exports = { list, getById, create, update, remove };
