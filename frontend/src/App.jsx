import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import MapPage from './pages/MapPage';
import CatalogPage from './pages/CatalogPage';
import NearbyPage from './pages/NearbyPage';

// Vistas:
//   /acceso     → inicio de sesión y registro (pública)
//   /           → mapa principal + tabla de ubicaciones
//   /cercanos   → buscar atención médica cercana a un punto
//   /catalogos  → CRUD de categorías, especialidades y médicos
export default function App() {
  return (
    <Routes>
      <Route path="/acceso" element={<AuthPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<MapPage />} />
          <Route path="/cercanos" element={<NearbyPage />} />
          <Route path="/catalogos" element={<CatalogPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
