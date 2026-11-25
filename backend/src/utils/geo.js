// Utilidades geográficas. Recordatorio: GeoJSON siempre usa [longitud, latitud].

function isValidLngLat(pair) {
  if (!Array.isArray(pair) || pair.length !== 2) return false;
  const [lng, lat] = pair.map(Number);
  return Number.isFinite(lng) && Number.isFinite(lat) && lng >= -180 && lng <= 180 && lat >= -90 && lat <= 90;
}

// Un anillo de polígono GeoJSON debe terminar en el mismo punto donde empieza.
function closeRing(ring) {
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) return [...ring, [first[0], first[1]]];
  return ring;
}

// Distancia aproximada en metros entre dos puntos [lng, lat] (fórmula de Haversine).
function distanceMeters([lng1, lat1], [lng2, lat2]) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

// Escapa caracteres especiales para usar texto del usuario dentro de una RegExp.
function escapeRegex(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = { isValidLngLat, closeRing, distanceMeters, escapeRegex };
