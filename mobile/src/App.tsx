import { StatusBar } from "expo-status-bar";
import { AuthProvider } from "./context/AuthContext";
import { HouseholdProvider } from "./context/HouseholdContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AppNavigator } from "./navigation/AppNavigator";

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <HouseholdProvider>
          <StatusBar style="dark" />
          <AppNavigator />
        </HouseholdProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
