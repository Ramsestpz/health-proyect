const dateFormatter = new Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' });

export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '—');

export const formatCoord = (n) => Number(n).toFixed(6);

export const formatDistance = (meters) => (meters < 1000 ? `${Math.round(meters)} m` : `${(meters / 1000).toFixed(1)} km`);

export const STATUSES = ['Disponible', 'Saturado', 'Cerrado'];
export const ZONE_TYPES = ['Cobertura', 'Riesgo sanitario', 'Campaña de salud', 'Otra'];
export const SHIFTS = ['Matutino', 'Vespertino', 'Nocturno', 'Mixto'];

export const STATUS_STYLES = {
  Disponible: 'bg-mint/15 text-[#167a67] ring-mint/30',
  Saturado: 'bg-amber/20 text-[#9a5d06] ring-amber/40',
  Cerrado: 'bg-ink/10 text-ink-soft ring-ink/20',
};
