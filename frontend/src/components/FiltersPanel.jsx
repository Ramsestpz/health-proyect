import { STATUSES } from '../utils/format';

// Búsqueda y filtros. Los valores viajan al backend como ?search=&category=&status=&zone=&open24h=
export default function FiltersPanel({ filters, setFilters, categories, zones, total }) {
  const set = (field) => (e) => setFilters((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));
  const active = Object.values(filters).some(Boolean);

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-lg font-extrabold">Buscar y filtrar</h2>
        <span className="text-xs font-semibold text-muted">{total} resultado(s)</span>
      </div>
      <div className="space-y-3">
        <div>
          <label className="label" htmlFor="search">
            Nombre
          </label>
          <input id="search" className="input" placeholder="Ej. farmacia, hospital…" value={filters.search} onChange={set('search')} />
        </div>
        <div>
          <label className="label" htmlFor="category">
            Categoría
          </label>
          <select id="category" className="input" value={filters.category} onChange={set('category')}>
            <option value="">Todas</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label" htmlFor="status">
              Estado
            </label>
            <select id="status" className="input" value={filters.status} onChange={set('status')}>
              <option value="">Todos</option>
              {STATUSES.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label" htmlFor="zone">
              Dentro de zona
            </label>
            <select id="zone" className="input" value={filters.zone} onChange={set('zone')}>
              <option value="">Cualquiera</option>
              {zones.map((z) => (
                <option key={z._id} value={z._id}>
                  {z.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={filters.open24h} onChange={set('open24h')} className="h-4 w-4 accent-coral" />
          Solo abiertos 24 horas
        </label>
        {active && (
          <button className="btn-ghost btn-sm w-full" onClick={() => setFilters({ search: '', category: '', status: '', zone: '', open24h: false })}>
            Limpiar filtros
          </button>
        )}
      </div>
    </div>
  );
}
