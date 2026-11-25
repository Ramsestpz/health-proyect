import L from 'leaflet';

// Centro de León, Gto. (Leaflet usa [latitud, longitud])
export const LEON_CENTER = [21.1236, -101.6806];
export const TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
export const TILE_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>';

// GeoJSON [lng, lat] → Leaflet [lat, lng]
export const toLatLng = ([lng, lat]) => [lat, lng];

// Anillo de un Polygon GeoJSON → arreglo de [lat, lng] para <Polygon>
export const polygonToLatLngs = (geometry) => geometry.coordinates[0].map(toLatLng);

const escapeHtml = (text) => String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Íconos en forma de pin con el color y emoji de la categoría (se cachean)
const cache = new Map();
export function categoryIcon(category, { closed = false } = {}) {
  const color = category?.color || '#10243a';
  const icon = category?.icon || '+';
  const key = `${color}|${icon}|${closed}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      L.divIcon({
        className: '',
        html: `<div class="pin ${closed ? 'pin-closed' : ''}" style="background:${escapeHtml(color)}"><span>${escapeHtml(icon)}</span></div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 41],
        popupAnchor: [0, -38],
      })
    );
  }
  return cache.get(key);
}

export const draftIcon = L.divIcon({
  className: '',
  html: '<div class="pin pin-draft"><span>+</span></div>',
  iconSize: [34, 34],
  iconAnchor: [17, 41],
  popupAnchor: [0, -38],
});

export const rankIcon = (n, color) =>
  L.divIcon({ className: '', html: `<div class="rank-pin" style="background:${escapeHtml(color)}">${n}</div>`, iconSize: [26, 26], iconAnchor: [13, 13], popupAnchor: [0, -12] });

export const youIcon = L.divIcon({
  className: '',
  html: '<div style="width:18px;height:18px;border-radius:999px;background:#10243a;border:4px solid #fff;box-shadow:0 0 0 6px rgba(16,36,58,.2)"></div>',
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});
