import { useEffect, useState } from 'react';

// Espera a que el usuario deje de escribir antes de consultar al backend.
export default function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
