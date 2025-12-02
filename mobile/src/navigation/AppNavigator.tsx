import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useAuth } from "../hooks/useAuth";
import { LoginScreen } from "../screens/auth/LoginScreen";
import { HomeScreen } from "../screens/home/HomeScreen";

const Stack = createNativeStackNavigator();

export function AppNavigator() {
	const {isAuthenticated} = useAuth();

	return (
		<NavigationContainer>
			<Stack.Navigator
				screenOptions={{
					headerShown: false,
				}}
			>
				{isAuthenticated ? (
					<Stack.Screen name="Home" component={HomeScreen} />
				) : (
					<Stack.Screen name="Login" component={LoginScreen} />
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
