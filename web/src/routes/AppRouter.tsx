import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../pages/auth/LoginPage";
import { DashboardPage } from "../pages/app/DashboardPage";
import { IngredientsPage } from "../pages/app/IngredientsPage";
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

      <Route
        path="/ingredients"
        element={
          <PrivateRoute>
            <IngredientsPage />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
