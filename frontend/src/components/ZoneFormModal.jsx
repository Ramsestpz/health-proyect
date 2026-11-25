import { useState } from 'react';
import { Modal } from './ui';
import { ZONE_TYPES } from '../utils/format';

const COLORS = ['#2bb39a', '#e4572e', '#5b6cff', '#f2a541', '#8e5bd6', '#10243a'];

// Modal para nombrar una zona recién dibujada (o editar una existente).
export default function ZoneFormModal({ open, initial, vertices, onSave, onClose }) {
  const [form, setForm] = useState(() => ({ name: '', description: '', type: 'Cobertura', color: COLORS[0], ...initial }));
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return setError('Ponle un nombre a la zona');
    setSaving(true);
    try {
      await onSave({ name: form.name.trim(), description: form.description.trim(), type: form.type, color: form.color });
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={initial?._id ? 'Editar zona' : 'Guardar zona dibujada'}>
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        {vertices && <p className="rounded-lg bg-paper px-3 py-2 text-xs text-muted">Polígono con {vertices} vértices. Se guardará como GeoJSON Polygon [longitud, latitud].</p>}
        <div>
          <label className="label">Nombre</label>
          <input className="input" value={form.name} onChange={set('name')} autoFocus placeholder="Ej. Cobertura Centro de Salud Obregón" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="label">Tipo</label>
            <select className="input" value={form.type} onChange={set('type')}>
              {ZONE_TYPES.map((t) => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Color</label>
            <div className="flex gap-1.5 pt-1">
              {COLORS.map((c) => (
                <button
                  type="button"
                  key={c}
                  onClick={() => setForm((f) => ({ ...f, color: c }))}
                  className={`h-7 w-7 rounded-full border-2 ${form.color === c ? 'border-ink' : 'border-white'}`}
                  style={{ background: c }}
                  aria-label={`Color ${c}`}
                />
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="label">Descripción</label>
          <textarea className="input" rows={2} value={form.description} onChange={set('description')} />
        </div>
        {error && <p className="text-sm font-semibold text-coral">{error}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-ghost" onClick={onClose}>
            Cancelar
          </button>
          <button type="submit" disabled={saving} className="btn-coral">
            {saving ? 'Guardando…' : 'Guardar zona'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
