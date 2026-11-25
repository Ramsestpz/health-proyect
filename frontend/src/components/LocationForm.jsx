import { useState } from 'react';
import { STATUSES, formatCoord } from '../utils/format';

const empty = { name: '', description: '', category: '', address: '', phone: '', status: 'Disponible', open24h: false };

// Formulario de ubicación que se usa dentro del popup (para registrar y para editar).
// coordinates llega como [longitud, latitud], igual que en GeoJSON.
export default function LocationForm({ initial, coordinates, categories, onSubmit, onCancel, submitLabel = 'Guardar' }) {
  const [form, setForm] = useState(() => ({
    ...empty,
    ...initial,
    category: initial?.category?._id || initial?.category || categories[0]?._id || '',
  }));
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = {};
    if (!form.name.trim()) found.name = 'El nombre es obligatorio';
    if (!form.category) found.category = 'Elige una categoría';
    setErrors(found);
    if (Object.keys(found).length) return;

    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category,
        address: form.address.trim(),
        phone: form.phone.trim(),
        status: form.status,
        open24h: form.open24h,
        coordinates,
      });
    } catch (err) {
      setErrors(Object.fromEntries((err.errors || []).map((x) => [x.field, x.message])));
    } finally {
      setSaving(false);
    }
  };

  const errorText = (field) => errors[field] && <p className="mt-0.5 text-[11px] font-semibold text-coral">{errors[field]}</p>;

  if (categories.length === 0) {
    return <p className="text-sm text-muted">Primero crea al menos una categoría en la vista de Catálogos.</p>;
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5 text-ink" noValidate>
      <div>
        <label className="label">Nombre</label>
        <input className="input py-1.5" value={form.name} onChange={set('name')} placeholder="Ej. Farmacia del Centro" autoFocus />
        {errorText('name')}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Categoría</label>
          <select className="input py-1.5" value={form.category} onChange={set('category')}>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>
                {c.icon} {c.name}
              </option>
            ))}
          </select>
          {errorText('category')}
        </div>
        <div>
          <label className="label">Estado</label>
          <select className="input py-1.5" value={form.status} onChange={set('status')}>
            {STATUSES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="label">Descripción</label>
        <textarea className="input py-1.5" rows={2} value={form.description} onChange={set('description')} placeholder="Servicios, horario, notas…" />
        {errorText('description')}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Dirección</label>
          <input className="input py-1.5" value={form.address} onChange={set('address')} />
        </div>
        <div>
          <label className="label">Teléfono</label>
          <input className="input py-1.5" value={form.phone} onChange={set('phone')} />
        </div>
      </div>
      <label className="flex items-center gap-2 text-sm font-semibold">
        <input type="checkbox" checked={form.open24h} onChange={set('open24h')} className="h-4 w-4 accent-coral" />
        Abierto las 24 horas
      </label>
      <p className="rounded-lg bg-paper px-2 py-1 font-mono text-[11px] text-muted">
        lat {formatCoord(coordinates[1])} · lng {formatCoord(coordinates[0])}
      </p>
      {errorText('coordinates')}
      <div className="flex gap-2 pt-1">
        <button type="submit" disabled={saving} className="btn-coral btn-sm flex-1">
          {saving ? 'Guardando…' : submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="btn-ghost btn-sm">
          Cancelar
        </button>
      </div>
    </form>
  );
}
