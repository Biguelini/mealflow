import { TouchableOpacity, StyleSheet, ViewStyle } from "react-native";
import { colors } from "../../theme/colors";
import type { LucideIcon } from "lucide-react-native";

type IconButtonProps = {
  icon: LucideIcon;
  onPress: () => void;
  size?: number;
  color?: string;
  variant?: "default" | "ghost" | "destructive";
  style?: ViewStyle;
  disabled?: boolean;
};

export function IconButton({
  icon: Icon,
  onPress,
  size = 18,
  color,
  variant = "default",
  style,
  disabled = false,
}: IconButtonProps) {
  const iconColor =
    color ??
    (variant === "destructive"
      ? colors.destructive
      : variant === "ghost"
      ? colors.mutedForeground
      : colors.foreground);

  return (
    <TouchableOpacity
      style={[
        styles.button,
        variant === "ghost" && styles.ghost,
        disabled && styles.disabled,
        style,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <Icon size={size} color={iconColor} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  ghost: {
    backgroundColor: "transparent",
  },
  disabled: {
    opacity: 0.5,
  },
});
