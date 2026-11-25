// Error controlado de la aplicación: lleva el código HTTP que debe responderse.
// Los servicios lanzan AppError y el errorHandler lo convierte en respuesta JSON.
class AppError extends Error {
  constructor(message, statusCode = 500, details = undefined) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }

  static badRequest(message, details) {
    return new AppError(message, 400, details);
  }

  static unauthorized(message = 'No autorizado') {
    return new AppError(message, 401);
  }

  static notFound(message = 'Recurso no encontrado') {
    return new AppError(message, 404);
  }
}

module.exports = AppError;
