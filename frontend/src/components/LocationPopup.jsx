import { useState } from 'react';
import LocationForm from './LocationForm';
import { CategoryBadge, StatusBadge } from './ui';
import { formatCoord, formatDate } from '../utils/format';

// Contenido del popup de cada ubicación: ver, editar ahí mismo o eliminar ahí mismo.
export default function LocationPopup({ location, categories, onUpdate, onDelete }) {
  const [mode, setMode] = useState('view'); // view | edit | confirm
  const [busy, setBusy] = useState(false);
  const [lng, lat] = location.geometry.coordinates;

  if (mode === 'edit') {
    return (
      <div>
        <p className="mb-2 font-display text-lg font-extrabold">Editar ubicación</p>
        <LocationForm
          initial={location}
          coordinates={location.geometry.coordinates}
          categories={categories}
          submitLabel="Guardar cambios"
          onCancel={() => setMode('view')}
          onSubmit={async (data) => {
            await onUpdate(location._id, data);
            setMode('view');
          }}
        />
      </div>
    );
  }

  return (
    <div className="text-ink">
      <div className="mb-1 flex flex-wrap items-center gap-1.5">
        <CategoryBadge category={location.category} />
        <StatusBadge status={location.status} />
        {location.open24h && <span className="rounded-full bg-ink px-2 py-0.5 text-[11px] font-bold text-white">24 h</span>}
      </div>
      <p className="font-display text-lg leading-tight font-extrabold">{location.name}</p>
      {location.description && <p className="mt-1 text-sm text-ink-soft">{location.description}</p>}
      <dl className="mt-2 space-y-0.5 text-xs text-muted">
        {location.address && (
          <div>
            <dt className="inline font-bold text-ink-soft">Dirección: </dt>
            <dd className="inline">{location.address}</dd>
          </div>
        )}
        {location.phone && (
          <div>
            <dt className="inline font-bold text-ink-soft">Teléfono: </dt>
            <dd className="inline">{location.phone}</dd>
          </div>
        )}
        <div className="font-mono">
          {formatCoord(lat)}, {formatCoord(lng)}
        </div>
        <div>
          Registró {location.createdBy?.name || '—'} · {formatDate(location.createdAt)}
        </div>
      </dl>

      {mode === 'confirm' ? (
        <div className="mt-3 rounded-xl border border-coral/30 bg-coral/10 p-2.5">
          <p className="text-xs font-semibold text-coral-dark">¿Eliminar “{location.name}”? También se eliminarán los médicos asignados.</p>
          <div className="mt-2 flex gap-2">
            <button
              disabled={busy}
              className="btn btn-sm flex-1 bg-coral text-white hover:bg-coral-dark"
              onClick={async () => {
                setBusy(true);
                try {
                  await onDelete(location._id);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? 'Eliminando…' : 'Sí, eliminar'}
            </button>
            <button className="btn-ghost btn-sm" onClick={() => setMode('view')}>
              No
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-3 flex gap-2">
          <button className="btn-primary btn-sm flex-1" onClick={() => setMode('edit')}>
            Editar
          </button>
          <button className="btn-danger btn-sm flex-1" onClick={() => setMode('confirm')}>
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
