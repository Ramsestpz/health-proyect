import { useState } from 'react';
import { EmptyState } from './ui';

// Lista de zonas guardadas: ver en el mapa, filtrar por zona, editar o eliminar.
export default function ZonesPanel({ zones, onFocus, onFilter, onEdit, onDelete }) {
  const [confirmId, setConfirmId] = useState(null);

  return (
    <div className="card p-4">
      <h2 className="font-display text-lg font-extrabold">Zonas</h2>
      <p className="mb-3 text-xs text-muted">Dibuja con las herramientas ⬠ / ▭ de la esquina del mapa.</p>
      {zones.length === 0 ? (
        <EmptyState>Aún no hay zonas.</EmptyState>
      ) : (
        <ul className="space-y-2">
          {zones.map((zone) => (
            <li key={zone._id} className="rounded-xl border border-line bg-white p-2.5">
              <div className="flex items-start gap-2">
                <span className="mt-1 h-3 w-3 shrink-0 rounded-sm" style={{ background: zone.color }} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold">{zone.name}</p>
                  <p className="text-[11px] text-muted">
                    {zone.type} · {zone.locationsCount} establecimiento(s)
                  </p>
                </div>
              </div>
              {confirmId === zone._id ? (
                <div className="mt-2 flex items-center gap-2 text-xs">
                  <span className="flex-1 font-semibold text-coral-dark">¿Eliminar zona?</span>
                  <button className="btn btn-sm bg-coral text-white" onClick={() => onDelete(zone._id).finally(() => setConfirmId(null))}>
                    Sí
                  </button>
                  <button className="btn-ghost btn-sm" onClick={() => setConfirmId(null)}>
                    No
                  </button>
                </div>
              ) : (
                <div className="mt-2 grid grid-cols-4 gap-1">
                  <button className="btn-ghost btn-sm px-1" onClick={() => onFocus(zone)}>
                    Ver
                  </button>
                  <button className="btn-ghost btn-sm px-1" onClick={() => onFilter(zone._id)}>
                    Filtrar
                  </button>
                  <button className="btn-ghost btn-sm px-1" onClick={() => onEdit(zone)}>
                    Editar
                  </button>
                  <button className="btn-danger btn-sm px-1" onClick={() => setConfirmId(zone._id)}>
                    Borrar
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
