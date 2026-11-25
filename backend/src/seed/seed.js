const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const User = require('../models/User');
const Category = require('../models/Category');
const Specialty = require('../models/Specialty');
const Doctor = require('../models/Doctor');
const Location = require('../models/Location');
const Zone = require('../models/Zone');

const TEST_USER = {
  name: 'Usuario de Prueba',
  email: process.env.SEED_USER_EMAIL || 'demo@saludcerca.mx',
  password: process.env.SEED_USER_PASSWORD || 'Demo12345',
};

const categories = [
  { name: 'Hospital', color: '#e4572e', icon: 'IconBuildingHospital', description: 'Atención de urgencias, hospitalización y cirugía' },
  { name: 'Farmacia', color: '#2bb39a', icon: 'IconPill', description: 'Venta de medicamentos; algunas con consultorio anexo' },
  { name: 'Laboratorio', color: '#5b6cff', icon: 'IconTestPipe', description: 'Análisis clínicos y estudios de imagen' },
  { name: 'Consultorio', color: '#f2a541', icon: 'IconStethoscope', description: 'Consulta externa de medicina general o especialidad' },
  { name: 'Centro de salud', color: '#8e5bd6', icon: 'IconMedicalCross', description: 'Unidades públicas de primer nivel: vacunación y control' },
];

const specialties = [
  { name: 'Medicina general', description: 'Primer contacto, diagnóstico y canalización' },
  { name: 'Pediatría', description: 'Atención de niñas, niños y adolescentes' },
  { name: 'Ginecología', description: 'Salud de la mujer y control prenatal' },
  { name: 'Cardiología', description: 'Corazón y sistema circulatorio' },
  { name: 'Traumatología', description: 'Lesiones de huesos, músculos y articulaciones' },
  { name: 'Odontología', description: 'Salud bucal' },
];

// [nombre, categoría, [lng, lat], dirección, teléfono, estado, 24h, descripción]
const locations = [
  ['Hospital Ficticio San Rafael', 'Hospital', [-101.6812, 21.1255], 'Calle Madero 210, Zona Centro', '477 100 2001', 'Disponible', true, 'Urgencias 24 h, hospitalización y quirófanos.'],
  ['Clínica del Moral', 'Hospital', [-101.6961, 21.1528], 'Blvd. Campestre 1450, Jardines del Moral', '477 100 2002', 'Saturado', true, 'Hospital privado de segundo nivel con urgencias pediátricas.'],
  ['Farmacia Coecillo', 'Farmacia', [-101.6765, 21.1291], 'Calle Juárez 501, El Coecillo', '477 100 2003', 'Disponible', true, 'Farmacia con consultorio anexo, abierta toda la noche.'],
  ['Farmacia Paraísos', 'Farmacia', [-101.6585, 21.1078], 'Av. México 320, Los Paraísos', '477 100 2004', 'Disponible', false, 'Medicamentos genéricos y de patente.'],
  ['Farmacia León Moderno', 'Farmacia', [-101.6757, 21.1158], 'Calle Hermanos Aldama 812, León Moderno', '477 100 2005', 'Cerrado', false, 'Cerrada temporalmente por remodelación.'],
  ['Laboratorio Análisis Bajío', 'Laboratorio', [-101.6890, 21.1310], 'Blvd. López Mateos 1020, San Juan Bosco', '477 100 2006', 'Disponible', false, 'Química sanguínea, biometría y pruebas COVID.'],
  ['Imagen Diagnóstica Campestre', 'Laboratorio', [-101.7051, 21.1579], 'Av. Cerro Gordo 220, Campestre', '477 100 2007', 'Saturado', false, 'Rayos X, ultrasonido y tomografía.'],
  ['Consultorio Dr. Ejemplo', 'Consultorio', [-101.6902, 21.1197], 'Calle 5 de Mayo 330, San Juan de Dios', '477 100 2008', 'Disponible', false, 'Consulta general y certificados médicos.'],
  ['Consultorio Pediátrico Valle', 'Consultorio', [-101.6998, 21.1641], 'Valle del Mezquital 101, Valle del Campestre', '477 100 2009', 'Disponible', false, 'Pediatría y vacunación infantil con cita.'],
  ['Centro de Salud Obregón', 'Centro de salud', [-101.6719, 21.1312], 'Calle 20 de Enero 600, Obregón', '477 100 2010', 'Saturado', false, 'Vacunación, control de diabetes e hipertensión.'],
  ['Centro de Salud San Rafael', 'Centro de salud', [-101.6482, 21.1381], 'Blvd. Hilario Medina 900, San Rafael', '477 100 2011', 'Disponible', false, 'Primer nivel de atención y planificación familiar.'],
  ['Hospital Ficticio del Sur', 'Hospital', [-101.6620, 21.0985], 'Blvd. Aeropuerto 2300, Col. Valle de Señora', '477 100 2012', 'Disponible', true, 'Urgencias, traumatología y terapia intensiva.'],
];

// [nombre, cédula, especialidad, establecimiento, teléfono, turno]
const doctors = [
  ['Dra. Ana Martínez Ruiz', '10000001', 'Medicina general', 'Hospital Ficticio San Rafael', '477 200 0001', 'Matutino'],
  ['Dr. Luis Hernández Soto', '10000002', 'Traumatología', 'Hospital Ficticio del Sur', '477 200 0002', 'Nocturno'],
  ['Dra. Sofía Ramírez León', '10000003', 'Pediatría', 'Consultorio Pediátrico Valle', '477 200 0003', 'Vespertino'],
  ['Dr. Carlos Gómez Pérez', '10000004', 'Cardiología', 'Clínica del Moral', '477 200 0004', 'Mixto'],
  ['Dra. Laura Torres Díaz', '10000005', 'Ginecología', 'Clínica del Moral', '477 200 0005', 'Matutino'],
  ['Dr. Miguel Castro Vega', '10000006', 'Medicina general', 'Centro de Salud Obregón', '477 200 0006', 'Matutino'],
  ['Dra. Paola Navarro Gil', '10000007', 'Odontología', 'Centro de Salud San Rafael', '477 200 0007', 'Vespertino'],
  ['Dr. Jorge Medina Luna', '10000008', 'Medicina general', 'Farmacia Coecillo', '477 200 0008', 'Nocturno'],
];

// Anillos [lng, lat]; el último vértice repite el primero.
const zones = [
  {
    name: 'Cobertura Zona Centro',
    type: 'Cobertura',
    color: '#2bb39a',
    description: 'Área atendida por las unidades del centro histórico',
    ring: [[-101.6950, 21.1350], [-101.6650, 21.1350], [-101.6650, 21.1150], [-101.6950, 21.1150], [-101.6950, 21.1350]],
  },
  {
    name: 'Campaña de vacunación Campestre',
    type: 'Campaña de salud',
    color: '#5b6cff',
    description: 'Brigada de vacunación de influenza (noviembre)',
    ring: [[-101.7120, 21.1700], [-101.6900, 21.1700], [-101.6880, 21.1480], [-101.7120, 21.1480], [-101.7120, 21.1700]],
  },
];

async function run() {
  const reset = process.argv.includes('--reset');
  await connectDB();

  if (reset) {
    await Promise.all([Doctor, Location, Zone, Specialty, Category].map((M) => M.deleteMany({})));
    await User.deleteOne({ email: TEST_USER.email });
    console.log('Colecciones limpiadas (--reset)');
  } else if ((await Location.estimatedDocumentCount()) > 0) {
    console.log('La base ya tiene ubicaciones. Usa "npm run seed -- --reset" si quieres borrar y recargar.');
    return;
  }

  // Usuario de prueba (se crea o se actualiza su contraseña)
  const passwordHash = await bcrypt.hash(TEST_USER.password, 10);
  const user = await User.findOneAndUpdate(
    { email: TEST_USER.email },
    { name: TEST_USER.name, email: TEST_USER.email, passwordHash },
    { upsert: true, returnDocument: 'after' }
  );

  // Índices (únicos y 2dsphere) antes de insertar
  await Promise.all([User, Category, Specialty, Doctor, Location, Zone].map((M) => M.syncIndexes()));

  const catDocs = await Category.insertMany(categories.map((c) => ({ ...c, createdBy: user._id })));
  const catId = Object.fromEntries(catDocs.map((c) => [c.name, c._id]));

  const specDocs = await Specialty.insertMany(specialties.map((s) => ({ ...s, createdBy: user._id })));
  const specId = Object.fromEntries(specDocs.map((s) => [s.name, s._id]));

  const locDocs = await Location.insertMany(
    locations.map(([name, category, coordinates, address, phone, status, open24h, description]) => ({
      name,
      category: catId[category],
      geometry: { type: 'Point', coordinates },
      address,
      phone,
      status,
      open24h,
      description,
      createdBy: user._id,
    }))
  );
  const locId = Object.fromEntries(locDocs.map((l) => [l.name, l._id]));

  await Doctor.insertMany(
    doctors.map(([fullName, licenseNumber, specialty, location, phone, shift]) => ({
      fullName,
      licenseNumber,
      specialty: specId[specialty],
      location: locId[location],
      phone,
      shift,
      createdBy: user._id,
    }))
  );

  await Zone.insertMany(
    zones.map(({ ring, ...zone }) => ({ ...zone, geometry: { type: 'Polygon', coordinates: [ring] }, createdBy: user._id }))
  );

  console.log('Datos de prueba cargados:');
  console.log(`  ${categories.length} categorías, ${specialties.length} especialidades, ${locations.length} ubicaciones, ${doctors.length} médicos, ${zones.length} zonas`);
  console.log(`  Usuario de prueba → ${TEST_USER.email} / ${TEST_USER.password}`);
}

run()
  .catch((error) => {
    console.error('Error al cargar datos:', error.message);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
