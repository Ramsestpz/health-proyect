import { createContext, useCallback, useContext, useMemo, useState } from 'react';

// Mensajes visibles de éxito y error en toda la aplicación.
const ToastContext = createContext(null);

const STYLES = {
  success: 'border-mint/40 bg-white text-ink [&_b]:text-mint',
  error: 'border-coral/40 bg-white text-ink [&_b]:text-coral',
  info: 'border-line bg-white text-ink [&_b]:text-ink-soft',
};
const TITLES = { success: 'Listo', error: 'Error', info: 'Aviso' };

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const push = useCallback(
    (type, message, details = []) => {
      const id = crypto.randomUUID();
      setToasts((list) => [...list.slice(-3), { id, type, message, details }]);
      setTimeout(() => dismiss(id), type === 'error' ? 6000 : 3500);
    },
    [dismiss]
  );

  const value = useMemo(
    () => ({
      success: (msg) => push('success', msg),
      info: (msg) => push('info', msg),
      // Acepta un ApiError: muestra su mensaje y la lista de campos con error
      error: (err) => push('error', typeof err === 'string' ? err : err.message, err?.errors || []),
    }),
    [push]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 bottom-4 z-[2000] flex w-[min(380px,calc(100vw-2rem))] flex-col gap-2" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`pointer-events-auto rounded-xl border px-4 py-3 text-sm shadow-lg ${STYLES[t.type]}`}>
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <b className="mr-1">{TITLES[t.type]}.</b>
                {t.message}
                {t.details.length > 0 && (
                  <ul className="mt-1 list-disc pl-4 text-xs text-muted">
                    {t.details.map((d) => (
                      <li key={d.field + d.message}>{d.message}</li>
                    ))}
                  </ul>
                )}
              </div>
              <button onClick={() => dismiss(t.id)} className="text-muted hover:text-ink" aria-label="Cerrar mensaje">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);
