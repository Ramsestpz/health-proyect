const { Schema, model } = require('mongoose');

// Tipo de establecimiento de salud: Hospital, Farmacia, Laboratorio, etc.
const categorySchema = new Schema(
  {
    name: { type: String, required: [true, 'El nombre es obligatorio'], unique: true, trim: true, maxlength: 60 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    color: { type: String, match: [/^#[0-9a-fA-F]{6}$/, 'Color inválido (usa formato #RRGGBB)'], default: '#e4572e' },
    icon: { type: String, trim: true, maxlength: 4, default: '+' }, // emoji o letra que se pinta en el marcador
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = model('Category', categorySchema);
