import { ReactNode } from "react";
import { View, Text, StyleSheet } from "react-native";
import { colors } from "../../theme/colors";

type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {action && <View style={styles.action}>{action}</View>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  title: {
    color: colors.foreground,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  description: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    marginTop: 8,
  },
  action: {
    marginTop: 20,
  },
});
