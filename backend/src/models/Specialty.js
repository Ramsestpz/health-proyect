const { Schema, model } = require('mongoose');

// Especialidad médica: Pediatría, Cardiología, Medicina general, etc.
const specialtySchema = new Schema(
  {
    name: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = model('Specialty', specialtySchema);
