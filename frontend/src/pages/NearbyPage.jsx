import { useEffect, useState } from 'react';
import { Circle, MapContainer, Marker, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { CategoryBadge, EmptyState, StatusBadge } from '../components/ui';
import { LEON_CENTER, TILE_ATTRIBUTION, TILE_URL, rankIcon, toLatLng, youIcon } from '../utils/map';
import { formatDistance } from '../utils/format';
import { categoryOptionLabel } from '../utils/categoryIconRegistry';

const RADII = [1000, 3000, 5000, 10000];

function PickPoint({ onPick }) {
  useMapEvents({ click: (e) => onPick([e.latlng.lng, e.latlng.lat]) });
  return null;
}

function FlyTo({ point }) {
  const map = useMap();
  useEffect(() => {
    if (point) map.flyTo(toLatLng(point), Math.max(map.getZoom(), 14), { duration: 0.6 });
  }, [point, map]);
  return null;
}

// Vista 3: "¿Dónde me atiendo cerca?" — ordena establecimientos por distancia con $geoNear.
export default function NearbyPage() {
  const toast = useToast();
  const [point, setPoint] = useState(null); // [lng, lat]
  const [radius, setRadius] = useState(3000);
  const [category, setCategory] = useState('');
  const [onlyAvailable, setOnlyAvailable] = useState(true);
  const [categories, setCategories] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api
      .get('/categories')
      .then((r) => setCategories(r.data))
      .catch(toast.error);
  }, [toast]);

  useEffect(() => {
    if (!point) return;
    setLoading(true);
    api
      .get('/locations/nearby', { lng: point[0], lat: point[1], maxDistance: radius, category, onlyAvailable, limit: 15 })
      .then((r) => setResults(r.data))
      .catch(toast.error)
      .finally(() => setLoading(false));
  }, [point, radius, category, onlyAvailable, toast]);

  const useMyLocation = () => {
    if (!navigator.geolocation) return toast.error('Tu navegador no permite obtener la ubicación');
    navigator.geolocation.getCurrentPosition(
      (pos) => setPoint([pos.coords.longitude, pos.coords.latitude]),
      () => toast.error('No se pudo obtener tu ubicación. Haz clic en el mapa para elegir un punto.'),
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Atención cercana</h1>
        <p className="text-sm text-muted">Elige un punto (o usa tu ubicación) y te mostramos los establecimientos más cercanos, ordenados por distancia.</p>
      </div>

      <div className="grid gap-5 lg:grid-cols-[360px_1fr]">
        <aside className="space-y-5">
          <div className="card space-y-3 p-4">
            <button className="btn-primary w-full" onClick={useMyLocation}>
              📍 Usar mi ubicación
            </button>
            <p className="text-center text-xs text-muted">o haz clic en cualquier punto del mapa</p>
            <div>
              <span className="label">Radio de búsqueda</span>
              <div className="grid grid-cols-4 gap-1">
                {RADII.map((r) => (
                  <button key={r} onClick={() => setRadius(r)} className={`btn btn-sm ${radius === r ? 'bg-ink text-white' : 'border border-line bg-white'}`}>
                    {r / 1000} km
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="label" htmlFor="near-cat">
                Tipo de establecimiento
              </label>
              <select id="near-cat" className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="">Todos</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {categoryOptionLabel(c.icon, c.name)}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center gap-2 text-sm font-semibold">
              <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} className="h-4 w-4 accent-coral" />
              Ocultar establecimientos cerrados
            </label>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-line px-4 py-3">
              <h2 className="font-display text-lg font-extrabold">{loading ? 'Buscando…' : `${results.length} cerca de ti`}</h2>
            </div>
            {!point ? (
              <EmptyState>Elige un punto para comenzar.</EmptyState>
            ) : results.length === 0 && !loading ? (
              <EmptyState>Nada dentro de {radius / 1000} km. Prueba un radio mayor.</EmptyState>
            ) : (
              <ol className="max-h-[420px] divide-y divide-line overflow-auto">
                {results.map((r, i) => (
                  <li key={r._id} className="flex gap-3 px-4 py-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs font-extrabold text-white" style={{ background: r.category?.color }}>
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold leading-tight">{r.name}</p>
                        <span className="font-display text-sm font-extrabold whitespace-nowrap text-coral">{formatDistance(r.distance)}</span>
                      </div>
                      <div className="mt-1 flex flex-wrap gap-1">
                        <CategoryBadge category={r.category} />
                        <StatusBadge status={r.status} />
                        {r.open24h && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">24 h</span>}
                      </div>
                      {r.phone && <p className="mt-1 text-xs text-muted">Tel. {r.phone}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>

        <section className="card overflow-hidden p-1.5">
          <MapContainer center={LEON_CENTER} zoom={13} style={{ height: 640 }} className="w-full rounded-2xl">
            <TileLayer url={TILE_URL} attribution={TILE_ATTRIBUTION} />
            <PickPoint onPick={setPoint} />
            <FlyTo point={point} />
            {point && (
              <>
                <Circle center={toLatLng(point)} radius={radius} pathOptions={{ color: '#10243a', weight: 1.5, fillOpacity: 0.06, dashArray: '4 6' }} />
                <Marker position={toLatLng(point)} icon={youIcon} />
              </>
            )}
            {results.map((r, i) => (
              <Marker key={r._id} position={toLatLng(r.geometry.coordinates)} icon={rankIcon(i + 1, r.category?.color || '#10243a')}>
                <Popup>
                  <b>{r.name}</b>
                  <br />
                  {r.category?.name} · {formatDistance(r.distance)}
                  {r.address && (
                    <>
                      <br />
                      {r.address}
                    </>
                  )}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </section>
      </div>
    </div>
  );
}
