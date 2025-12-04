import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { PrivateRoute } from "@/routes/PrivateRoute";
import { AuthProvider } from "@/context/AuthContext";
import { DashboardPage } from "@/pages/dashboard/DashboardPage";

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* protegidas */}
          <Route
            path="/app"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />

          {/* fallback: redireciona pra /app (que vai checar auth) */}
          <Route
            path="*"
            element={
              <PrivateRoute>
                <DashboardPage />
              </PrivateRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
