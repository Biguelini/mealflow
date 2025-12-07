import { View, Text, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";

type BadgeVariant = "default" | "success" | "warning" | "destructive" | "muted";

type BadgeProps = {
  children: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
};

export function Badge({ children, variant = "default", style }: BadgeProps) {
  const variantStyles = {
    default: {
      bg: colors.primary + "20",
      text: colors.primary,
      border: colors.primary + "40",
    },
    success: {
      bg: "#22c55e20",
      text: "#22c55e",
      border: "#22c55e40",
    },
    warning: {
      bg: "#eab30820",
      text: "#eab308",
      border: "#eab30840",
    },
    destructive: {
      bg: colors.destructive + "20",
      text: colors.destructive,
      border: colors.destructive + "40",
    },
    muted: {
      bg: colors.muted,
      text: colors.mutedForeground,
      border: colors.border,
    },
  };

  const v = variantStyles[variant];

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: v.bg, borderColor: v.border },
        style,
      ]}
    >
      <Text style={[styles.text, { color: v.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  text: {
    fontSize: 11,
    fontWeight: "600",
  },
});
