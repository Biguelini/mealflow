import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "@/routes/PrivateRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { AuthProvider } from "@/context/AuthContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { RecipesPage } from "./pages/app/RecipesPage";

function DashboardPage() {
  return <div className="text-sm">Dashboard (resumo da semana)</div>;
}

function PantryPage() {
  return <div className="text-sm">Despensa</div>;
}

function MealPlanPage() {
  return <div className="text-sm">Plano de refeições</div>;
}

function ShoppingListsPage() {
  return <div className="text-sm">Listas de compras</div>;
}

function SettingsPage() {
  return <div className="text-sm">Configurações</div>;
}

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            path="/app"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
            <Route path="recipes" element={<RecipesPage />} />
            <Route path="pantry" element={<PantryPage />} />
            <Route path="meal-plan" element={<MealPlanPage />} />
            <Route path="shopping-lists" element={<ShoppingListsPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>

          <Route
            path="*"
            element={
              <PrivateRoute>
                <AppLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<DashboardPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
