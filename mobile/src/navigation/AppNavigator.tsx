import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Text, View, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  LayoutDashboard,
  BookOpen,
  CalendarRange,
  ShoppingCart,
  MoreHorizontal,
  Leaf,
  Archive,
  Settings,
} from "lucide-react-native";
import { useAuth } from "../hooks/useAuth";
import { colors } from "../theme/colors";

// Auth screens
import { LoginScreen } from "../screens/auth/LoginScreen";
import { RegisterScreen } from "../screens/auth/RegisterScreen";

// App screens
import { DashboardScreen } from "../screens/app/DashboardScreen";
import { IngredientsScreen } from "../screens/app/IngredientsScreen";
import { RecipesScreen } from "../screens/app/RecipesScreen";
import { PantryScreen } from "../screens/app/PantryScreen";
import { MealPlanScreen } from "../screens/app/MealPlanScreen";
import { ShoppingListScreen } from "../screens/app/ShoppingListScreen";
import { SettingsScreen } from "../screens/app/SettingsScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 65,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedForeground,
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: "500",
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          tabBarLabel: "Início",
          tabBarIcon: ({ color, size }) => (
            <LayoutDashboard size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Recipes"
        component={RecipesScreen}
        options={{
          tabBarLabel: "Receitas",
          tabBarIcon: ({ color, size }) => (
            <BookOpen size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="MealPlan"
        component={MealPlanScreen}
        options={{
          tabBarLabel: "Cardápio",
          tabBarIcon: ({ color, size }) => (
            <CalendarRange size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Shopping"
        component={ShoppingListScreen}
        options={{
          tabBarLabel: "Compras",
          tabBarIcon: ({ color, size }) => (
            <ShoppingCart size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="More"
        component={MoreNavigator}
        options={{
          tabBarLabel: "Mais",
          tabBarIcon: ({ color, size }) => (
            <MoreHorizontal size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

// Nested stack for "More" screens
function MoreNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
      <Stack.Screen name="Ingredients" component={IngredientsScreen} />
      <Stack.Screen name="Pantry" component={PantryScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}

// More menu screen
function MoreMenuScreen() {
  const navigation = useNavigation<any>();

  const menuItems = [
    { Icon: Leaf, label: "Ingredientes", screen: "Ingredients" },
    { Icon: Archive, label: "Despensa", screen: "Pantry" },
    { Icon: Settings, label: "Configurações", screen: "Settings" },
  ];

  return (
    <SafeAreaView style={styles.moreContainer} edges={["top"]}>
      <ScrollView contentContainerStyle={styles.moreContent}>
        <Text style={styles.moreTitle}>Mais opções</Text>
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.screen}
              style={styles.menuItem}
              onPress={() => navigation.navigate(item.screen)}
            >
              <View style={styles.menuIconContainer}>
                <item.Icon size={24} color={colors.primary} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
    </Stack.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated } = useAuth();

  return (
    <NavigationContainer>
      {isAuthenticated ? <AppTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  moreContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  moreContent: {
    padding: 16,
  },
  moreTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: colors.foreground,
    marginBottom: 24,
  },
  menuGrid: {
    gap: 12,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: colors.secondary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.foreground,
  },
});
