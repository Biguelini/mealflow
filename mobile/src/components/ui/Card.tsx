import { ReactNode } from "react";
import { View, Text, StyleSheet, ViewStyle, TextStyle } from "react-native";
import { colors } from "../../theme/colors";

type CardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function Card({ children, style }: CardProps) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function CardHeader({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.header, style]}>{children}</View>;
}

export function CardTitle({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.title, style]}>{children}</Text>;
}

export function CardDescription({ children, style }: { children: ReactNode; style?: TextStyle }) {
  return <Text style={[styles.description, style]}>{children}</Text>;
}

export function CardContent({ children, style }: { children: ReactNode; style?: ViewStyle }) {
  return <View style={[styles.content, style]}>{children}</View>;
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
