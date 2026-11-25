import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import useDebounce from '../hooks/useDebounce';
import HealthMap from '../components/HealthMap';
import FiltersPanel from '../components/FiltersPanel';
import ZonesPanel from '../components/ZonesPanel';
import ZoneFormModal from '../components/ZoneFormModal';
import LocationsTable from '../components/LocationsTable';

const REFRESH_MS = 15000; // además de refrescar tras cada cambio, se consulta cada 15 s

export default function MapPage() {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);

  const [filters, setFilters] = useState({ search: '', category: '', status: '', zone: '', open24h: false });
  const search = useDebounce(filters.search);
  const params = useMemo(() => ({ ...filters, search }), [filters, search]);

  const [draft, setDraft] = useState(null); // [lng, lat] del clic en el mapa
  const [focus, setFocus] = useState(null);
  const [zoneModal, setZoneModal] = useState(null);
  const mapSectionRef = useRef(null);

  // ---------- Carga de datos ----------
  const loadLocations = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true);
      try {
        const res = await api.get('/locations', params); // filtros resueltos en el backend
        setLocations(res.data);
        setUpdatedAt(new Date());
      } catch (err) {
        if (!silent) toast.error(err);
      } finally {
        setLoading(false);
      }
    },
    [params, toast]
  );

  const loadZones = useCallback(async () => {
    try {
      setZones((await api.get('/zones')).data);
    } catch (err) {
      toast.error(err);
    }
  }, [toast]);

  useEffect(() => {
    api
      .get('/categories')
      .then((res) => setCategories(res.data))
      .catch(toast.error);
    loadZones();
  }, [loadZones, toast]);

  useEffect(() => {
    loadLocations();
    const id = setInterval(() => loadLocations({ silent: true }), REFRESH_MS);
    return () => clearInterval(id);
  }, [loadLocations]);

  // ---------- Ubicaciones (CRUD desde el popup) ----------
  const handleCreate = async (data) => {
    try {
      const res = await api.post('/locations', data);
      toast.success(res.message);
      setDraft(null);
      await Promise.all([loadLocations(), loadZones()]);
    } catch (err) {
      toast.error(err);
      throw err; // para que el formulario marque los campos con error
    }
  };

  const handleUpdate = async (id, data) => {
    try {
      const res = await api.put(`/locations/${id}`, data);
      toast.success(res.message);
      await loadLocations();
    } catch (err) {
      toast.error(err);
      throw err;
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await api.del(`/locations/${id}`);
      toast.success(res.message);
      await Promise.all([loadLocations(), loadZones()]);
    } catch (err) {
      toast.error(err);
    }
  };

  // ---------- Zonas ----------
  const handleZoneSave = async (data) => {
    try {
      const res =
        zoneModal.mode === 'create'
          ? await api.post('/zones', { ...data, coordinates: zoneModal.coordinates })
          : await api.put(`/zones/${zoneModal.zone._id}`, data);
      toast.success(res.message);
      setZoneModal(null);
      await loadZones();
    } catch (err) {
      toast.error(err);
      throw err;
    }
  };

  const handleZoneDelete = async (id) => {
    try {
      const res = await api.del(`/zones/${id}`);
      toast.success(res.message);
      if (filters.zone === id) setFilters((f) => ({ ...f, zone: '' }));
      await loadZones();
    } catch (err) {
      toast.error(err);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-extrabold">Mapa de salud de León</h1>
          <p className="text-sm text-muted">
            Haz <b className="text-ink">clic en el mapa</b> para registrar un establecimiento. Haz clic en un marcador para editarlo o eliminarlo.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          {categories.map((c) => (
            <span key={c._id} className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 font-semibold ring-1 ring-line">
              <span>{c.icon}</span>
              {c.name}
            </span>
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[300px_1fr]">
        <aside className="space-y-5">
          <FiltersPanel filters={filters} setFilters={setFilters} categories={categories} zones={zones} total={locations.length} />
          <ZonesPanel
            zones={zones}
            onFocus={(zone) => {
              mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              setFocus({ type: 'zone', geometry: zone.geometry, ts: Date.now() });
            }}
            onFilter={(id) => setFilters((f) => ({ ...f, zone: id }))}
            onEdit={(zone) => setZoneModal({ mode: 'edit', zone })}
            onDelete={handleZoneDelete}
          />
        </aside>
        <section ref={mapSectionRef} className="card scroll-mt-20 overflow-hidden p-1.5">
          <HealthMap
            locations={locations}
            zones={zones}
            categories={categories}
            draft={draft}
            setDraft={setDraft}
            onCreate={handleCreate}
            onUpdate={handleUpdate}
            onDelete={handleDelete}
            onZoneDrawn={(coordinates) => setZoneModal({ mode: 'create', coordinates })}
            focus={focus}
            height={640}
          />
        </section>
      </div>

      <LocationsTable
        locations={locations}
        loading={loading}
        updatedAt={updatedAt}
        onSelect={(l) => {
          mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          setFocus({ type: 'location', id: l._id, coordinates: l.geometry.coordinates, ts: Date.now() });
        }}
      />

      {zoneModal && (
        <ZoneFormModal
          open
          key={zoneModal.zone?._id || 'new'}
          initial={zoneModal.zone}
          vertices={zoneModal.mode === 'create' ? zoneModal.coordinates[0].length - 1 : null}
          onSave={handleZoneSave}
          onClose={() => setZoneModal(null)}
        />
      )}
    </div>
  );
}
