import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from '../components/Logo';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Validación en el cliente (el backend vuelve a validar todo)
function validateForm(mode, form) {
  const errors = {};
  if (mode === 'register' && !form.name.trim()) errors.name = 'Escribe tu nombre';
  if (!EMAIL_RE.test(form.email.trim())) errors.email = 'Escribe un correo válido';
  if (!form.password) errors.password = 'Escribe tu contraseña';
  else if (mode === 'register' && form.password.length < 8) errors.password = 'Mínimo 8 caracteres';
  if (mode === 'register' && form.password !== form.confirm) errors.confirm = 'Las contraseñas no coinciden';
  return errors;
}

export default function AuthPage() {
  const { user, login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);

  if (user) return <Navigate to={location.state?.from || '/'} replace />;

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const switchMode = (next) => {
    setMode(next);
    setErrors({});
    setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const found = validateForm(mode, form);
    setErrors(found);
    setServerError('');
    if (Object.keys(found).length) return;

    setLoading(true);
    try {
      if (mode === 'login') {
        await login({ email: form.email, password: form.password });
        toast.success('Sesión iniciada');
      } else {
        await register({ name: form.name, email: form.email, password: form.password });
        toast.success('Cuenta creada. ¡Bienvenido!');
      }
      navigate(location.state?.from || '/', { replace: true });
    } catch (err) {
      // Mensaje claro debajo del formulario (ej. "Correo o contraseña incorrectos")
      setServerError(err.message);
      const fieldErrors = Object.fromEntries((err.errors || []).map((x) => [x.field, x.message]));
      setErrors(fieldErrors);
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, type = 'text', autoComplete) => (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>
      <input id={name} type={type} autoComplete={autoComplete} value={form[name]} onChange={update(name)} className={`input ${errors[name] ? 'border-coral' : ''}`} />
      {errors[name] && <p className="mt-1 text-xs font-semibold text-coral">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="grid min-h-screen lg:grid-cols-[1.1fr_1fr]">
      {/* Panel informativo */}
      <section className="relative hidden overflow-hidden bg-ink p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <Logo light />
        <div className="relative z-10 max-w-lg">
          <p className="mb-4 text-sm font-bold tracking-[0.2em] text-coral uppercase">León, Guanajuato</p>
          <h1 className="font-display text-5xl leading-[1.05] font-extrabold">¿Dónde te atienden ahora, cerca de ti?</h1>
          <p className="mt-5 text-lg text-white/70">
            Un mapa colaborativo de hospitales, farmacias, laboratorios y centros de salud con su estado en tiempo real, zonas de cobertura y búsqueda por cercanía.
          </p>
        </div>
        <ul className="relative z-10 grid grid-cols-3 gap-4 text-sm text-white/70">
          <li>
            <b className="block font-display text-3xl text-white">24 h</b>filtra lo que abre toda la noche
          </li>
          <li>
            <b className="block font-display text-3xl text-white">km</b>ordena por distancia real
          </li>
          <li>
            <b className="block font-display text-3xl text-white">zonas</b>de cobertura y campañas
          </li>
        </ul>
        {/* Decoración: retícula tipo mapa */}
        <svg className="absolute -right-24 -bottom-24 h-[520px] w-[520px] opacity-[0.12]" viewBox="0 0 200 200" aria-hidden="true">
          {Array.from({ length: 11 }).map((_, i) => (
            <g key={i} stroke="#fff" strokeWidth="0.5">
              <line x1={i * 20} y1="0" x2={i * 20} y2="200" />
              <line x1="0" y1={i * 20} x2="200" y2={i * 20} />
            </g>
          ))}
          <circle cx="110" cy="90" r="46" fill="none" stroke="#e4572e" strokeWidth="2" />
          <circle cx="110" cy="90" r="5" fill="#e4572e" />
        </svg>
      </section>

      {/* Formulario */}
      <section className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <div className="mb-6 flex rounded-xl border border-line bg-white p-1">
            {[
              ['login', 'Iniciar sesión'],
              ['register', 'Crear cuenta'],
            ].map(([key, label]) => (
              <button
                key={key}
                type="button"
                onClick={() => switchMode(key)}
                className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${mode === key ? 'bg-ink text-white' : 'text-ink-soft hover:text-ink'}`}
              >
                {label}
              </button>
            ))}
          </div>

          <h2 className="font-display text-3xl font-extrabold">{mode === 'login' ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}</h2>
          <p className="mt-1 mb-6 text-sm text-muted">
            {mode === 'login' ? 'Entra para ver y actualizar el mapa de salud.' : 'Regístrate para empezar a reportar establecimientos.'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {mode === 'register' && field('name', 'Nombre completo', 'text', 'name')}
            {field('email', 'Correo electrónico', 'email', 'email')}
            {field('password', 'Contraseña', 'password', mode === 'login' ? 'current-password' : 'new-password')}
            {mode === 'register' && field('confirm', 'Confirmar contraseña', 'password', 'new-password')}

            {serverError && (
              <div className="rounded-xl border border-coral/30 bg-coral/10 px-3 py-2 text-sm font-semibold text-coral-dark" role="alert">
                {serverError}
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-coral w-full py-3">
              {loading ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
            </button>
          </form>
        </div>
      </section>
    </div>
  );
}
