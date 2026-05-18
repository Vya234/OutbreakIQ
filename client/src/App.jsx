import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { OutbreakProvider } from '@/context/OutbreakContext';
import { Layout } from '@/components/layout/Layout';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { GuestRoute } from '@/components/auth/GuestRoute';
import { HomePage } from '@/pages/HomePage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MapPage } from '@/pages/MapPage';
import { AssistantPage } from '@/pages/AssistantPage';
import { RecommendationsPage } from '@/pages/RecommendationsPage';
import { AdminPage } from '@/pages/AdminPage';
import { AdminLoginPage } from '@/pages/AdminLoginPage';
import { AboutPage } from '@/pages/AboutPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <OutbreakProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/map" element={<MapPage />} />
                <Route path="/assistant" element={<AssistantPage />} />
                <Route path="/recommendations" element={<RecommendationsPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route
                  path="/admin/login"
                  element={
                    <GuestRoute>
                      <AdminLoginPage />
                    </GuestRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute>
                      <AdminPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </OutbreakProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
