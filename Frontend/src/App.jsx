import { Routes, Route } from 'react-router-dom';
import { useAuthInit } from './hooks/useAuthInit';
import PrivateRoute from './components/routes/PrivateRoute';
import RoleBasedRoute from './components/routes/RoleBasedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminPanel from './pages/AdminPanel';
import TrucksPage from './pages/TrucksPage';
import TrailersPage from './pages/TrailersPage';
import TiresPage from './pages/TiresPage';
import FuelPage from './pages/FuelPage';
import DriversPage from './pages/DriversPage';
import TripsPage from './pages/TripsPage';
import Unauthorized from './pages/Unauthorized';
import NotFound from './pages/NotFound';
import Register from './pages/Register';
import './App.css';

function App() {
  // Initialize auth state from localStorage
  useAuthInit();

  return (
    <div className="app">
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected routes - Requires authentication */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        {/* Role-based routes - Admin only */}
        <Route
          path="/admin"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <AdminPanel />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/admin/trucks"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <TrucksPage />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/admin/trailers"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <TrailersPage />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/admin/tires"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <TiresPage />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/admin/fuel"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <FuelPage />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/admin/drivers"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <DriversPage />
            </RoleBasedRoute>
          }
        />

        <Route
          path="/admin/trips"
          element={
            <RoleBasedRoute allowedRoles={['ADMIN']}>
              <TripsPage />
            </RoleBasedRoute>
          }
        />

        {/* Catch all - 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default App;
