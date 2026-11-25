import { CategoryBadge, EmptyState, StatusBadge } from './ui';
import { formatCoord, formatDate } from '../utils/format';

// Tabla con todos los datos de las ubicaciones (sin el ID). La categoría se muestra por nombre.
export default function LocationsTable({ locations, loading, updatedAt, onSelect }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-line px-4 py-3">
        <h2 className="font-display text-lg font-extrabold">Ubicaciones registradas</h2>
        <span className="flex items-center gap-2 text-xs text-muted">
          <span className={`h-2 w-2 rounded-full ${loading ? 'animate-pulse bg-amber' : 'bg-mint'}`} />
          {loading ? 'Actualizando…' : `En vivo · actualizado ${updatedAt ? updatedAt.toLocaleTimeString('es-MX') : '—'}`}
        </span>
      </div>
      <div className="max-h-[460px] overflow-auto">
        {locations.length === 0 ? (
          <EmptyState>No hay ubicaciones con estos filtros. Haz clic en el mapa para registrar una.</EmptyState>
        ) : (
          <table className="w-full min-w-[1100px] border-collapse">
            <thead>
              <tr>
                {['Nombre', 'Categoría', 'Descripción', 'Dirección', 'Teléfono', 'Estado', '24 h', 'Latitud', 'Longitud', 'Registró', 'Registro', 'Última edición'].map((h) => (
                  <th key={h} className="th">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {locations.map((l) => (
                <tr key={l._id} onClick={() => onSelect(l)} className="cursor-pointer transition hover:bg-paper" title="Ver en el mapa">
                  <td className="td font-bold">{l.name}</td>
                  <td className="td">
                    <CategoryBadge category={l.category} />
                  </td>
                  <td className="td max-w-[240px] text-ink-soft">{l.description || '—'}</td>
                  <td className="td max-w-[200px]">{l.address || '—'}</td>
                  <td className="td whitespace-nowrap">{l.phone || '—'}</td>
                  <td className="td">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="td">{l.open24h ? 'Sí' : 'No'}</td>
                  <td className="td font-mono text-xs">{formatCoord(l.geometry.coordinates[1])}</td>
                  <td className="td font-mono text-xs">{formatCoord(l.geometry.coordinates[0])}</td>
                  <td className="td whitespace-nowrap">{l.createdBy?.name || '—'}</td>
                  <td className="td text-xs whitespace-nowrap">{formatDate(l.createdAt)}</td>
                  <td className="td text-xs whitespace-nowrap">{formatDate(l.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
