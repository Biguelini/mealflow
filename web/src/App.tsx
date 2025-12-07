import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivateRoute } from "@/routes/PrivateRoute";
import { LoginPage } from "@/pages/auth/LoginPage";
import { RegisterPage } from "@/pages/auth/RegisterPage";
import { AuthProvider } from "@/context/AuthContext";
import { HouseholdProvider } from "@/context/HouseholdContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { AppLayout } from "@/components/layout/AppLayout";
import { RecipesPage } from "./pages/app/RecipesPage";
import { PantryPage } from "./pages/app/PantryPage";
import { MealPlanPage } from "./pages/app/MealPlanPage";
import { DashboardPage } from "./pages/app/DashboardPage";
import { IngredientsPage } from "./pages/app/IngredientsPage";
import { ShoppingListsPage } from "./pages/app/ShoppingListsPage";
import { SettingsPage } from "./pages/app/SettingsPage";

export function App() {
	return (
		<ThemeProvider>
			<AuthProvider>
				<HouseholdProvider>
					<BrowserRouter>
						<Routes>
							<Route path="/login" element={<LoginPage />} />
							<Route path="/register" element={<RegisterPage />} />

							<Route
								path="/"
								element={
									<PrivateRoute>
										<AppLayout />
									</PrivateRoute>
								}
							>
								<Route index element={<DashboardPage />} />
								<Route path="ingredients" element={<IngredientsPage />} />
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
				</HouseholdProvider>
			</AuthProvider>
		</ThemeProvider>
	);
}
