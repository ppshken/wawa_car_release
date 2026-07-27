import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider } from './context/SidebarContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { CarReleaseList } from './pages/CarReleaseList';
import { StoresPage } from './pages/master/StoresPage';
import { KeyHoldersPage } from './pages/master/KeyHoldersPage';
import { PdaDevicesPage } from './pages/master/PdaDevicesPage';
import { PaymentsPage } from './pages/master/PaymentsPage';
import { VehiclesPage } from './pages/master/VehiclesPage';
import { ParkingPage } from './pages/master/ParkingPage';
import { AccountingStatusPage } from './pages/master/AccountingStatusPage';
import { PositionProductPage } from './pages/master/PositionProductPage';

import { UsersListPage } from './pages/users/UsersListPage';
import { UserLevelsPage } from './pages/users/UserLevelsPage';
import { PermissionsPage } from './pages/users/PermissionsPage';
import { AccessPage } from './pages/users/AccessPage';
import { RoutePage } from './pages/RoutePage';
import { ImportOptimoPage } from './pages/ImportOptimoPage';
import { Reports } from './pages/Reports';

const ProtectedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-400 font-sans">
        กำลังโหลดระบบ...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <SidebarProvider>
      <div className="h-screen bg-white flex flex-col text-slate-900 font-sans overflow-hidden">
        <Navbar />
        <div className="flex flex-1 bg-white overflow-hidden">
          <Sidebar />
          <main className="flex-1 p-3 sm:p-5 w-full max-w-full bg-white overflow-y-auto overflow-x-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>

          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/releases"
            element={
              <ProtectedLayout>
                <CarReleaseList />
              </ProtectedLayout>
            }
          />

          {/* Master Data Standalone Pages */}
          <Route path="/stores" element={<Navigate to="/master/stores" replace />} />
          <Route path="/master" element={<Navigate to="/master/stores" replace />} />
          <Route path="/master/stores" element={<ProtectedLayout><StoresPage /></ProtectedLayout>} />
          <Route path="/master/keys" element={<ProtectedLayout><KeyHoldersPage /></ProtectedLayout>} />
          <Route path="/master/pda" element={<ProtectedLayout><PdaDevicesPage /></ProtectedLayout>} />
          <Route path="/master/payments" element={<ProtectedLayout><PaymentsPage /></ProtectedLayout>} />
          <Route path="/master/vehicles" element={<ProtectedLayout><VehiclesPage /></ProtectedLayout>} />
          <Route path="/master/parking" element={<ProtectedLayout><ParkingPage /></ProtectedLayout>} />
          <Route path="/master/accounting-status" element={<ProtectedLayout><AccountingStatusPage /></ProtectedLayout>} />
          <Route path="/master/position-product" element={<ProtectedLayout><PositionProductPage /></ProtectedLayout>} />

          {/* User Management & Permissions Standalone Pages */}
          <Route path="/users" element={<ProtectedLayout><UsersListPage /></ProtectedLayout>} />
          <Route path="/user-levels" element={<ProtectedLayout><UserLevelsPage /></ProtectedLayout>} />
          <Route path="/permissions" element={<ProtectedLayout><PermissionsPage /></ProtectedLayout>} />
          <Route path="/user-access" element={<ProtectedLayout><AccessPage /></ProtectedLayout>} />

          {/* OptimoRoute Map & Import */}
          <Route path="/route" element={<ProtectedLayout><RoutePage /></ProtectedLayout>} />
          <Route path="/optimoroute" element={<Navigate to="/route" replace />} />
          <Route path="/import-optimo" element={<ProtectedLayout><ImportOptimoPage /></ProtectedLayout>} />

          <Route
            path="/reports"
            element={
              <ProtectedLayout>
                <Reports />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
);

};

export default App;
