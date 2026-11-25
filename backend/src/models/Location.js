const { Schema, model } = require('mongoose');

// Ubicación exacta: un establecimiento de salud registrado haciendo clic en el mapa.
const locationSchema = new Schema(
  {
    name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, maxlength: 100 },
    description: { type: String, trim: true, maxlength: 500, default: '' },
    // Relación por referencia: Location → Category (se resuelve con populate)
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: [true, 'La categoría es obligatoria'] },
    // GeoJSON Point. ¡Orden obligatorio: [longitud, latitud]!
    geometry: {
      type: { type: String, enum: ['Point'], default: 'Point', required: true },
      coordinates: {
        type: [Number],
        required: true,
        validate: {
          validator: ([lng, lat]) => lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90,
          message: 'Coordenadas fuera de rango ([longitud, latitud])',
        },
      },
    },
    address: { type: String, trim: true, maxlength: 200, default: '' },
    phone: { type: String, trim: true, maxlength: 20, default: '' },
    status: { type: String, enum: ['Disponible', 'Saturado', 'Cerrado'], default: 'Disponible' },
    open24h: { type: Boolean, default: false },
    // Relación por referencia: Location → User que la registró
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

// Índice geoespacial: permite $near, $geoNear y $geoWithin.
locationSchema.index({ geometry: '2dsphere' });

module.exports = model('Location', locationSchema);
