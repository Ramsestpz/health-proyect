import { useEffect } from 'react';
import { STATUS_STYLES } from '../utils/format';

// Piezas pequeñas de interfaz que se reutilizan en varias vistas.

export function StatusBadge({ status }) {
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-bold ring-1 ${STATUS_STYLES[status] || ''}`}>{status}</span>;
}

export function CategoryBadge({ category }) {
  if (!category) return <span className="text-muted">Sin categoría</span>;
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2 py-0.5 text-xs font-semibold whitespace-nowrap ring-1 ring-line">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: category.color }} />
      {category.name}
    </span>
  );
}

export function Modal({ title, open, onClose, children, width = 'max-w-lg' }) {
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[1500] grid place-items-center bg-ink/40 p-4 backdrop-blur-[2px]" onMouseDown={onClose}>
      <div role="dialog" aria-modal="true" aria-label={title} className={`card w-full ${width} max-h-[90vh] overflow-y-auto p-6`} onMouseDown={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-start justify-between gap-4">
          <h3 className="font-display text-2xl font-extrabold">{title}</h3>
          <button onClick={onClose} className="text-muted hover:text-ink" aria-label="Cerrar">
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function EmptyState({ children }) {
  return <div className="px-4 py-10 text-center text-sm text-muted">{children}</div>;
}
