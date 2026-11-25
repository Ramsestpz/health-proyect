const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    name: { type: String, required: [true, 'El nombre es obligatorio'], trim: true, maxlength: 80 },
    email: {
      type: String,
      required: [true, 'El correo es obligatorio'],
      unique: true, // índice único: MongoDB rechaza correos duplicados
      lowercase: true,
      trim: true,
    },
    // Solo se guarda el hash de bcrypt, nunca la contraseña en texto plano.
    // select: false evita que el hash viaje en las consultas normales.
    passwordHash: { type: String, required: true, select: false },
  },
  { timestamps: true }
);

module.exports = model('User', userSchema);
