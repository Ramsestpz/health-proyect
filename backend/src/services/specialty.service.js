const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const AppError = require('../utils/AppError');

const pick = ({ name, description }) => ({ name, description });

async function list() {
  const specialties = await Specialty.find().sort({ name: 1 }).lean();
  const counts = await Doctor.aggregate([{ $group: { _id: '$specialty', total: { $sum: 1 } } }]);
  const byId = Object.fromEntries(counts.map((c) => [String(c._id), c.total]));
  return specialties.map((s) => ({ ...s, doctorsCount: byId[String(s._id)] || 0 }));
}

async function getById(id) {
  const specialty = await Specialty.findById(id);
  if (!specialty) throw AppError.notFound('La especialidad no existe');
  return specialty;
}

async function create(data, user) {
  return Specialty.create({ ...pick(data), createdBy: user._id });
}

async function update(id, data) {
  const specialty = await Specialty.findByIdAndUpdate(id, pick(data), { returnDocument: 'after', runValidators: true });
  if (!specialty) throw AppError.notFound('La especialidad no existe');
  return specialty;
}

async function remove(id) {
  const inUse = await Doctor.countDocuments({ specialty: id });
  if (inUse > 0) {
    throw AppError.badRequest(`No se puede eliminar: ${inUse} médico(s) tienen esta especialidad.`);
  }
  const specialty = await Specialty.findByIdAndDelete(id);
  if (!specialty) throw AppError.notFound('La especialidad no existe');
  return specialty;
}

module.exports = { list, getById, create, update, remove };
