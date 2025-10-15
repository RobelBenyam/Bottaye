import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useAuthStore } from "./stores/authStore";
import { useThemeStore } from "./stores/themeStore";
import { initializeSampleData } from "./services/localStorage";
import RegisterPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import PropertiesPage from "./pages/PropertiesPage";
import PropertyDetailPage from "./pages/PropertyDetailPage";
import UnitsPage from "./pages/UnitsPage";
import UnitDetailPage from "./pages/UnitDetailPage";
import TenantsPage from "./pages/TenantsPage";
import PaymentsPage from "./pages/PaymentsPage";
import ReportsPage from "./pages/ReportsPage";
import UsersPage from "./pages/UsersPage";
import MaintenancePage from "./pages/MaintenancePage";
import LeasesPage from "./pages/LeasesPage";
import Layout from "./components/Layout";
import LoadingSpinner from "./components/LoadingSpinner";
import LoginPage from "./pages/LoginPage";

function App() {
  const { user, loading, initializeAuth } = useAuthStore();
  const { isDark } = useThemeStore();

  useEffect(() => {
    initializeAuth();
    // Initialize sample data in local storage if needed
    initializeSampleData();
  }, [initializeAuth]);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  if (loading) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center ${
          isDark ? "dark" : ""
        }`}
      >
        <div className="bg-white dark:bg-secondary-900">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={isDark ? "dark" : ""}>
      <Router>
        <div className="min-h-screen bg-secondary-50 dark:bg-secondary-900 transition-colors duration-300">
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: isDark ? "#1e293b" : "#fff",
                color: isDark ? "#f8fafc" : "#0f172a",
                border: `1px solid ${isDark ? "#334155" : "#e2e8f0"}`,
              },
            }}
          />

          {!user ? (
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              <Route path="*" element={<Navigate to="/login" replace />} />
            </Routes>
          ) : (
            <Layout>
              <Routes>
                <Route
                  path="/"
                  element={<Navigate to="/dashboard" replace />}
                />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/properties" element={<PropertiesPage />} />
                <Route
                  path="/properties/:id"
                  element={<PropertyDetailPage />}
                />
                <Route path="/units" element={<UnitsPage />} />
                <Route path="/units/:id" element={<UnitDetailPage />} />
                <Route path="/tenants" element={<TenantsPage />} />
                <Route path="/payments" element={<PaymentsPage />} />
                <Route path="/maintenance" element={<MaintenancePage />} />
                <Route path="/leases" element={<LeasesPage />} />
                <Route path="/reports" element={<ReportsPage />} />
                {user.role === "super_admin" && (
                  <Route path="/users" element={<UsersPage />} />
                )}

                <Route
                  path="*"
                  element={<Navigate to="/dashboard" replace />}
                />
              </Routes>
            </Layout>
          )}
        </div>
      </Router>
    </div>
  );
}

export default App;
