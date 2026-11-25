import { useCallback, useEffect, useState } from 'react';
import { api } from '../api/client';
import { useToast } from '../context/ToastContext';
import { EmptyState, Modal } from './ui';

/**
 * CRUD completo (crear, listar, editar, eliminar) configurable por entidad.
 *   endpoint: ruta de la API ('/categories')
 *   fields:   campos del formulario [{ name, label, type, options?, required? }]
 *   columns:  columnas de la tabla [{ label, render(item) }]
 */
export default function CrudSection({ title, singular, description, endpoint, fields, columns, emptyItem, toForm, onChange }) {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null); // null | { item?, values }
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setItems((await api.get(endpoint)).data);
    } catch (err) {
      toast.error(err);
    } finally {
      setLoading(false);
    }
  }, [endpoint, toast]);

  useEffect(() => {
    load();
  }, [load]);

  const openCreate = () => {
    setErrors({});
    setEditing({ values: { ...emptyItem } });
  };
  const openEdit = (item) => {
    setErrors({});
    setEditing({ item, values: toForm ? toForm(item) : { ...item } });
  };

  const setValue = (name, value) => setEditing((e) => ({ ...e, values: { ...e.values, [name]: value } }));

  const handleSave = async (e) => {
    e.preventDefault();
    const found = {};
    fields.forEach((f) => {
      if (f.required && !String(editing.values[f.name] ?? '').trim()) found[f.name] = `${f.label} es obligatorio`;
    });
    setErrors(found);
    if (Object.keys(found).length) return;

    const body = Object.fromEntries(fields.map((f) => [f.name, typeof editing.values[f.name] === 'string' ? editing.values[f.name].trim() : editing.values[f.name]]));
    setSaving(true);
    try {
      const res = editing.item ? await api.put(`${endpoint}/${editing.item._id}`, body) : await api.post(endpoint, body);
      toast.success(res.message);
      setEditing(null);
      await load();
      onChange?.();
    } catch (err) {
      toast.error(err);
      setErrors(Object.fromEntries((err.errors || []).map((x) => [x.field, x.message])));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    try {
      const res = await api.del(`${endpoint}/${item._id}`);
      toast.success(res.message);
      await load();
      onChange?.();
    } catch (err) {
      toast.error(err); // ej. "No se puede eliminar: 3 ubicación(es) usan esta categoría"
    } finally {
      setConfirm(null);
    }
  };

  const renderField = (f) => {
    const value = editing.values[f.name] ?? '';
    const common = { id: f.name, value, onChange: (e) => setValue(f.name, e.target.value), className: `input ${errors[f.name] ? 'border-coral' : ''}` };
    let control;
    if (f.type === 'textarea') control = <textarea rows={3} {...common} />;
    else if (f.type === 'select')
      control = (
        <select {...common}>
          <option value="">Selecciona…</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      );
    else if (f.type === 'color')
      control = (
        <div className="flex items-center gap-2">
          <input type="color" value={value || '#000000'} onChange={(e) => setValue(f.name, e.target.value)} className="h-10 w-14 cursor-pointer rounded-lg border border-line" />
          <input {...common} />
        </div>
      );
    else control = <input type="text" placeholder={f.placeholder} {...common} />;

    return (
      <div key={f.name} className={f.full ? 'sm:col-span-2' : ''}>
        <label htmlFor={f.name} className="label">
          {f.label}
          {f.required && <span className="text-coral"> *</span>}
        </label>
        {control}
        {errors[f.name] && <p className="mt-1 text-xs font-semibold text-coral">{errors[f.name]}</p>}
      </div>
    );
  };

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="font-display text-xl font-extrabold">{title}</h2>
          <p className="text-sm text-muted">{description}</p>
        </div>
        <button className="btn-coral" onClick={openCreate}>
          + Nuevo registro
        </button>
      </div>

      <div className="overflow-x-auto">
        {loading ? (
          <EmptyState>Cargando…</EmptyState>
        ) : items.length === 0 ? (
          <EmptyState>No hay registros todavía.</EmptyState>
        ) : (
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.label} className="th">
                    {c.label}
                  </th>
                ))}
                <th className="th text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item._id} className="hover:bg-paper/60">
                  {columns.map((c) => (
                    <td key={c.label} className="td">
                      {c.render(item)}
                    </td>
                  ))}
                  <td className="td text-right whitespace-nowrap">
                    {confirm === item._id ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="text-xs font-semibold text-coral-dark">¿Eliminar?</span>
                        <button className="btn btn-sm bg-coral text-white" onClick={() => handleDelete(item)}>
                          Sí
                        </button>
                        <button className="btn-ghost btn-sm" onClick={() => setConfirm(null)}>
                          No
                        </button>
                      </span>
                    ) : (
                      <span className="inline-flex gap-2">
                        <button className="btn-ghost btn-sm" onClick={() => openEdit(item)}>
                          Editar
                        </button>
                        <button className="btn-danger btn-sm" onClick={() => setConfirm(item._id)}>
                          Eliminar
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {editing && (
        <Modal open title={editing.item ? `Editar ${singular}` : `Nuevo: ${singular}`} onClose={() => setEditing(null)}>
          <form onSubmit={handleSave} noValidate>
            <div className="grid gap-3 sm:grid-cols-2">{fields.map(renderField)}</div>
            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-ghost" onClick={() => setEditing(null)}>
                Cancelar
              </button>
              <button type="submit" disabled={saving} className="btn-coral">
                {saving ? 'Guardando…' : 'Guardar'}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </section>
  );
}
