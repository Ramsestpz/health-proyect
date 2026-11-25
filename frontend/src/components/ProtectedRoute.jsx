import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Sin sesión iniciada no se puede entrar a las vistas internas.
export default function ProtectedRoute() {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return <div className="grid min-h-screen place-items-center text-sm text-muted">Verificando sesión…</div>;
  }
  if (!user) {
    return <Navigate to="/acceso" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
