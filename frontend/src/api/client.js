// Cliente HTTP mínimo sobre fetch: agrega el token, convierte JSON y unifica los errores.
export const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/$/, '');

const TOKEN_KEY = 'saludcerca_token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

// Error con el mensaje y los detalles que regresa el errorHandler del backend
export class ApiError extends Error {
  constructor(message, status, errors = []) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (handler) => {
  onUnauthorized = handler;
};

// Convierte { search: 'x', category: '' } en "?search=x" (omite vacíos)
export function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== false) query.set(key, value);
  });
  const text = query.toString();
  return text ? `?${text}` : '';
}

export async function request(path, { method = 'GET', body, params } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(`${API_URL}${path}${toQuery(params)}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Revisa tu conexión o que la API esté encendida.', 0);
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    // Token vencido o inválido en una ruta protegida → cerrar sesión
    if (response.status === 401 && token && !path.startsWith('/auth/login')) onUnauthorized();
    throw new ApiError(data.message || `Error ${response.status}`, response.status, data.errors || []);
  }
  return data;
}

// Atajos por recurso
export const api = {
  get: (path, params) => request(path, { params }),
  post: (path, body) => request(path, { method: 'POST', body }),
  put: (path, body) => request(path, { method: 'PUT', body }),
  del: (path) => request(path, { method: 'DELETE' }),
};
