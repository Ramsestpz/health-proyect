import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import CategoryIcon from '../components/CategoryIcon';
import CrudSection from '../components/CrudSection';
import { SHIFTS } from '../utils/format';

const TABS = [
  { key: 'categories', label: 'Categorías' },
  { key: 'specialties', label: 'Especialidades' },
  { key: 'doctors', label: 'Médicos' },
];

export default function CatalogPage() {
  const toast = useToast();
  const [tab, setTab] = useState('categories');
  // Opciones para los selects de Médicos (relaciones con especialidad y establecimiento)
  const [specialties, setSpecialties] = useState([]);
  const [locations, setLocations] = useState([]);

  const loadOptions = useCallback(() => {
    Promise.all([api.get('/specialties'), api.get('/locations')])
      .then(([s, l]) => {
        setSpecialties(s.data);
        setLocations(l.data);
      })
      .catch(toast.error);
  }, [toast]);

  useEffect(() => {
    loadOptions();
  }, [loadOptions]);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-3xl font-extrabold">Catálogos</h1>
        <p className="text-sm text-muted">Administra los tipos de establecimiento, las especialidades médicas y el personal médico de cada lugar.</p>
      </div>

      <div className="inline-flex rounded-xl border border-line bg-white p-1">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-lg px-4 py-2 text-sm font-bold transition ${tab === t.key ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'categories' && (
        <CrudSection
          key="categories"
          title="Categorías de establecimiento"
          singular="categoría"
          description="Cada ubicación del mapa pertenece a una categoría (relación Location → Category)."
          endpoint="/categories"
          emptyItem={{ name: '', icon: 'IconBuildingHospital', color: '#e4572e', description: '' }}
          fields={[
            { name: 'name', label: 'Nombre', required: true },
            { name: 'icon', label: 'Ícono (clave Tabler)', placeholder: 'IconBuildingHospital' },
            { name: 'color', label: 'Color del marcador', type: 'color' },
            { name: 'description', label: 'Descripción', type: 'textarea', full: true },
          ]}
          columns={[
            {
              label: 'Categoría',
              render: (c) => (
                <span className="inline-flex items-center gap-2 font-bold">
                  <span className="grid h-7 w-7 place-items-center rounded-full text-sm" style={{ background: c.color }}>
                    <CategoryIcon name={c.icon} size={18} />
                  </span>
                  {c.name}
                </span>
              ),
            },
            { label: 'Descripción', render: (c) => <span className="text-ink-soft">{c.description || '—'}</span> },
            { label: 'Color', render: (c) => <code className="text-xs">{c.color}</code> },
            { label: 'Ubicaciones', render: (c) => c.locationsCount },
          ]}
        />
      )}

      {tab === 'specialties' && (
        <CrudSection
          key="specialties"
          title="Especialidades médicas"
          singular="especialidad"
          description="Se asignan a los médicos (relación Doctor → Specialty)."
          endpoint="/specialties"
          emptyItem={{ name: '', description: '' }}
          onChange={loadOptions}
          fields={[
            { name: 'name', label: 'Nombre', required: true, full: true },
            { name: 'description', label: 'Descripción', type: 'textarea', full: true },
          ]}
          columns={[
            { label: 'Especialidad', render: (s) => <b>{s.name}</b> },
            { label: 'Descripción', render: (s) => <span className="text-ink-soft">{s.description || '—'}</span> },
            { label: 'Médicos', render: (s) => s.doctorsCount },
          ]}
        />
      )}

      {tab === 'doctors' && (
        <CrudSection
          key="doctors"
          title="Médicos"
          singular="médico"
          description="Personal que atiende en cada establecimiento (Doctor → Specialty y Doctor → Location, con populate)."
          endpoint="/doctors"
          emptyItem={{ fullName: '', licenseNumber: '', specialty: '', location: '', phone: '', shift: 'Matutino' }}
          toForm={(d) => ({ ...d, specialty: d.specialty?._id || '', location: d.location?._id || '' })}
          fields={[
            { name: 'fullName', label: 'Nombre completo', required: true, full: true },
            { name: 'licenseNumber', label: 'Cédula profesional', required: true },
            { name: 'phone', label: 'Teléfono' },
            { name: 'specialty', label: 'Especialidad', type: 'select', required: true, options: specialties.map((s) => ({ value: s._id, label: s.name })) },
            { name: 'shift', label: 'Turno', type: 'select', options: SHIFTS.map((s) => ({ value: s, label: s })) },
            { name: 'location', label: 'Establecimiento', type: 'select', required: true, full: true, options: locations.map((l) => ({ value: l._id, label: l.name })) },
          ]}
          columns={[
            { label: 'Nombre', render: (d) => <b>{d.fullName}</b> },
            { label: 'Cédula', render: (d) => <code className="text-xs">{d.licenseNumber}</code> },
            { label: 'Especialidad', render: (d) => d.specialty?.name || '—' },
            { label: 'Establecimiento', render: (d) => d.location?.name || '—' },
            { label: 'Turno', render: (d) => d.shift },
            { label: 'Teléfono', render: (d) => d.phone || '—' },
          ]}
        />
      )}
    </div>
  );
}
