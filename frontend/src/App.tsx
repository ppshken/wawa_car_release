import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { SidebarProvider } from './context/SidebarContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';

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
import { ReleaseTypesPage } from './pages/master/ReleaseTypesPage';
import { LoadingTypesPage } from './pages/master/LoadingTypesPage';
import { GpsDistancePage } from './pages/master/GpsDistancePage';
import { OperationMenuPage } from './pages/master/OperationMenuPage';
import { ProblemTypesPage } from './pages/master/ProblemTypesPage';

import { UsersListPage } from './pages/users/UsersListPage';
import { UserLevelsPage } from './pages/users/UserLevelsPage';
import { PermissionsPage } from './pages/users/PermissionsPage';
import { AccessPage } from './pages/users/AccessPage';
import { RoutePage } from './pages/RoutePage';
import { ImportOptimoPage } from './pages/ImportOptimoPage';
import { Reports } from './pages/Reports';
import { AuditLog } from './pages/AuditLog';
import { ProfilePage } from './pages/ProfilePage';
import { ApiKeyManagement } from './pages/ApiKeyManagement';

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
          <main className="flex-1 p-3 sm:p-5 w-full max-w-full bg-white overflow-y-auto overflow-x-hidden pb-24 md:pb-5">
            {children}
          </main>
        </div>
        <BottomNav />
      </div>
    </SidebarProvider>
  );
};

const PermissionGuard: React.FC<{ permKey: string; children: React.ReactNode }> = ({ permKey, children }) => {
  const { user } = useAuth();

  let permissions: Record<string, boolean> = {};
  if (user?.menu_permissions) {
    if (typeof user.menu_permissions === 'string') {
      try { permissions = JSON.parse(user.menu_permissions); } catch (e) {}
    } else if (typeof user.menu_permissions === 'object') {
      permissions = user.menu_permissions as Record<string, boolean>;
    }
  }

  // If permissions loaded, check if allowed
  if (Object.keys(permissions).length > 0) {
    if (permissions[permKey] !== undefined) {
      if (!permissions[permKey]) {
        return <Navigate to="/" replace />;
      }
      return <>{children}</>;
    }
    return <Navigate to="/" replace />;
  }

  if (user?.level_user_id === 1) {
    return <>{children}</>;
  }

  return <>{children}</>;
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
                <PermissionGuard permKey="releases"><CarReleaseList /></PermissionGuard>
              </ProtectedLayout>
            }
          />

          {/* Master Data Standalone Pages */}
          <Route path="/stores" element={<Navigate to="/master/stores" replace />} />
          <Route path="/master" element={<Navigate to="/master/stores" replace />} />
          <Route path="/master/stores" element={<ProtectedLayout><PermissionGuard permKey="stores"><StoresPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/keys" element={<ProtectedLayout><PermissionGuard permKey="keys"><KeyHoldersPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/pda" element={<ProtectedLayout><PermissionGuard permKey="pda"><PdaDevicesPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/payments" element={<ProtectedLayout><PermissionGuard permKey="payments"><PaymentsPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/vehicles" element={<ProtectedLayout><PermissionGuard permKey="vehicles"><VehiclesPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/parking" element={<ProtectedLayout><PermissionGuard permKey="parking"><ParkingPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/accounting-status" element={<ProtectedLayout><PermissionGuard permKey="accounting_status"><AccountingStatusPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/position-product" element={<ProtectedLayout><PermissionGuard permKey="position_product"><PositionProductPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/release-types" element={<ProtectedLayout><PermissionGuard permKey="release_types"><ReleaseTypesPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/loading-types" element={<ProtectedLayout><PermissionGuard permKey="loading_types"><LoadingTypesPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/gps-distance" element={<ProtectedLayout><PermissionGuard permKey="gps_distance"><GpsDistancePage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/operation-menus" element={<ProtectedLayout><PermissionGuard permKey="operation_menus"><OperationMenuPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/master/problem-types" element={<ProtectedLayout><PermissionGuard permKey="problem_types"><ProblemTypesPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/operation-menu" element={<Navigate to="/master/operation-menus" replace />} />
          <Route path="/distance" element={<Navigate to="/master/gps-distance" replace />} />

          {/* User Management & Permissions Standalone Pages */}
          <Route path="/users" element={<ProtectedLayout><PermissionGuard permKey="users"><UsersListPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/user-levels" element={<ProtectedLayout><PermissionGuard permKey="user_levels"><UserLevelsPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/permissions" element={<ProtectedLayout><PermissionGuard permKey="permissions"><PermissionsPage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/user-access" element={<ProtectedLayout><PermissionGuard permKey="user_access"><AccessPage /></PermissionGuard></ProtectedLayout>} />

          {/* OptimoRoute Map & Import */}
          <Route path="/route" element={<ProtectedLayout><PermissionGuard permKey="route"><RoutePage /></PermissionGuard></ProtectedLayout>} />
          <Route path="/optimoroute" element={<Navigate to="/route" replace />} />
          <Route path="/import-optimo" element={<ProtectedLayout><PermissionGuard permKey="import_optimo"><ImportOptimoPage /></PermissionGuard></ProtectedLayout>} />

          <Route
            path="/reports"
            element={
              <ProtectedLayout>
                <PermissionGuard permKey="reports"><Reports /></PermissionGuard>
              </ProtectedLayout>
            }
          />
          <Route
            path="/audit-log"
            element={
              <ProtectedLayout>
                <PermissionGuard permKey="reports"><AuditLog /></PermissionGuard>
              </ProtectedLayout>
            }
          />

          <Route
            path="/api-keys"
            element={
              <ProtectedLayout>
                <ApiKeyManagement />
              </ProtectedLayout>
            }
          />

          <Route path="/profile" element={<ProtectedLayout><ProfilePage /></ProtectedLayout>} />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
);

};

export default App;
