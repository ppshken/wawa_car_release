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
import { CreateCarRelease } from './pages/CreateCarRelease';
import { CarReleaseDetail } from './pages/CarReleaseDetail';
import { DriverCheckInOut } from './pages/DriverCheckInOut';
import { CarReturnPage } from './pages/CarReturnPage';
import { Stores } from './pages/Stores';
import { Reports } from './pages/Reports';
import { Users } from './pages/Users';


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
      <div className="min-h-screen bg-white flex flex-col text-slate-900 font-sans">
        <Navbar />
        <div className="flex flex-1 bg-white">
          <Sidebar />
          <main className="flex-1 p-3 sm:p-5 w-full max-w-full bg-white overflow-x-hidden">
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
          <Route
            path="/releases/create"
            element={
              <ProtectedLayout>
                <CreateCarRelease />
              </ProtectedLayout>
            }
          />
          <Route
            path="/releases/:id"
            element={
              <ProtectedLayout>
                <CarReleaseDetail />
              </ProtectedLayout>
            }
          />
          <Route
            path="/driver"
            element={
              <ProtectedLayout>
                <DriverCheckInOut />
              </ProtectedLayout>
            }
          />
          <Route
            path="/return"
            element={
              <ProtectedLayout>
                <CarReturnPage />
              </ProtectedLayout>
            }
          />
          <Route
            path="/stores"
            element={
              <ProtectedLayout>
                <Stores />
              </ProtectedLayout>
            }
          />
          <Route
            path="/reports"
            element={
              <ProtectedLayout>
                <Reports />
              </ProtectedLayout>
            }
          />
          <Route
            path="/users"
            element={
              <ProtectedLayout>
                <Users />
              </ProtectedLayout>
            }
          />
          <Route path="/permissions" element={<Navigate to="/users" replace />} />
          <Route path="/user-levels" element={<Navigate to="/users" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </BrowserRouter>
    </ToastProvider>
  </AuthProvider>
);

};

export default App;
