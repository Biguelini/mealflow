import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/dashboard/DashboardPage";
import { PrivateRoute } from "./PrivateRoute";

export function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPage />
          </PrivateRoute>
        }
      />

      {/* qualquer rota desconhecida redireciona pro dashboard (ou login) */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
