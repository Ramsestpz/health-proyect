import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import Logo from './Logo';

const links = [
  { to: '/', label: 'Mapa y registros', end: true },
  { to: '/cercanos', label: 'Atención cercana' },
  { to: '/catalogos', label: 'Catálogos' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.info('Cerraste sesión');
    navigate('/acceso');
  };

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-[1100] bg-ink text-white">
        <div className="mx-auto flex max-w-[1500px] flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
          <Logo light />
          <nav className="flex flex-1 flex-wrap gap-1">
            {links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-1.5 text-sm font-semibold transition ${isActive ? 'bg-white text-ink' : 'text-white/75 hover:bg-white/10 hover:text-white'}`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden text-white/70 sm:inline">
              Hola, <b className="text-white">{user?.name?.split(' ')[0]}</b>
            </span>
            <button onClick={handleLogout} className="rounded-lg border border-white/25 px-3 py-1.5 font-semibold hover:bg-white hover:text-ink">
              Salir
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-[1500px] px-4 py-5">
        <Outlet />
      </main>
    </div>
  );
}
