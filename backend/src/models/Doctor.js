const { Schema, model } = require('mongoose');

// Médico que atiende en un establecimiento.
// Relaciones por referencia: Doctor → Specialty y Doctor → Location.
const doctorSchema = new Schema(
  {
    fullName: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, maxlength: 100 },
    licenseNumber: { type: String, required: [true, 'La cédula profesional es obligatoria'], unique: true, trim: true, maxlength: 20 },
    specialty: { type: Schema.Types.ObjectId, ref: 'Specialty', required: [true, 'La especialidad es obligatoria'] },
    location: { type: Schema.Types.ObjectId, ref: 'Location', required: [true, 'El establecimiento es obligatorio'] },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    shift: { type: String, enum: ['Matutino', 'Vespertino', 'Nocturno', 'Mixto'], default: 'Matutino' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = model('Doctor', doctorSchema);
