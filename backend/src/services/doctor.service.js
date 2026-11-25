const Doctor = require('../models/Doctor');
const Specialty = require('../models/Specialty');
const Location = require('../models/Location');
const AppError = require('../utils/AppError');

const pick = ({ fullName, licenseNumber, specialty, location, phone, shift }) => ({ fullName, licenseNumber, specialty, location, phone, shift });

// populate convierte los ObjectId en los documentos relacionados (solo los campos necesarios)
const withRelations = (query) =>
  query.populate('specialty', 'name').populate('location', 'name address').populate('createdBy', 'name');

// Verifica que las referencias existan antes de guardar
async function assertReferences({ specialty, location }) {
  const [hasSpecialty, hasLocation] = await Promise.all([Specialty.exists({ _id: specialty }), Location.exists({ _id: location })]);
  if (!hasSpecialty) throw AppError.badRequest('La especialidad seleccionada no existe');
  if (!hasLocation) throw AppError.badRequest('El establecimiento seleccionado no existe');
}

async function list({ location } = {}) {
  const filter = {};
  if (location) filter.location = location;
  return withRelations(Doctor.find(filter).sort({ fullName: 1 }));
}

async function getById(id) {
  const doctor = await withRelations(Doctor.findById(id));
  if (!doctor) throw AppError.notFound('El médico no existe');
  return doctor;
}

async function create(data, user) {
  await assertReferences(data);
  const doctor = await Doctor.create({ ...pick(data), createdBy: user._id });
  return getById(doctor._id);
}

async function update(id, data) {
  await assertReferences(data);
  const doctor = await Doctor.findByIdAndUpdate(id, pick(data), { returnDocument: 'after', runValidators: true });
  if (!doctor) throw AppError.notFound('El médico no existe');
  return getById(doctor._id);
}

async function remove(id) {
  const doctor = await Doctor.findByIdAndDelete(id);
  if (!doctor) throw AppError.notFound('El médico no existe');
  return doctor;
}

module.exports = { list, getById, create, update, remove };
