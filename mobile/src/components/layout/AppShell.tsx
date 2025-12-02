import { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors } from "../../theme/colors";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";

type AppShellProps = {
  children: ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.logo}>MealFlow</Text>
          <Text style={styles.subtitle}>Planejamento de refeições</Text>
        </View>

        {user && (
          <View style={styles.userArea}>
            <Text style={styles.userName}>{user.name}</Text>
            <Button title="Sair" variant="outline" onPress={logout} />
          </View>
        )}
      </View>

      <View style={styles.content}>{children}</View>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },

  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  logo: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },

  subtitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 16,
  },

  userArea: {
    alignItems: "flex-end",
    gap: 6,
  },

  userName: {
    color: colors.mutedForeground,
    fontSize: 12,
    lineHeight: 16,
  },

  content: {
    flex: 1,
    padding: 16,
  },
});
