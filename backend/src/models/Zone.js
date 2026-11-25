const { Schema, model } = require('mongoose');

// Zona dibujada por el usuario (cobertura, riesgo sanitario, campaña, etc.).
const zoneSchema = new Schema(
  {
    name: { type: String, required: [true, 'El nombre de la zona es obligatorio'], trim: true, maxlength: 80 },
    description: { type: String, trim: true, maxlength: 300, default: '' },
    type: { type: String, enum: ['Cobertura', 'Riesgo sanitario', 'Campaña de salud', 'Otra'], default: 'Cobertura' },
    color: { type: String, match: [/^#[0-9a-fA-F]{6}$/, 'Color inválido'], default: '#2bb39a' },
    // GeoJSON Polygon: arreglo de anillos; cada vértice es [longitud, latitud]
    // y el primer vértice se repite al final para cerrar el anillo.
    geometry: {
      type: { type: String, enum: ['Polygon'], default: 'Polygon', required: true },
      coordinates: { type: [[[Number]]], required: true },
    },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

zoneSchema.index({ geometry: '2dsphere' });

module.exports = model('Zone', zoneSchema);
