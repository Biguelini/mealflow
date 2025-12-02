import { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardHeader({ children }: { children: ReactNode }) {
  return <View style={styles.header}>{children}</View>;
}

export function CardTitle({ children }: { children: ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function CardDescription({ children }: { children: ReactNode }) {
  return <Text style={styles.description}>{children}</Text>;
}

export function CardContent({ children }: { children: ReactNode }) {
  return <View style={styles.content}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 16,
  },

  header: {
    gap: 2,
    marginBottom: 8,
  },

  title: {
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 22,
    color: colors.foreground,
  },

  description: {
    fontSize: 13,
    lineHeight: 18,
    color: colors.mutedForeground,
  },

  content: {
    marginTop: 12,
  },
});
