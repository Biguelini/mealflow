import {
  TouchableOpacity,
  Text,
  StyleSheet,
  GestureResponderEvent,
  ViewStyle,
} from "react-native";
import { colors } from "../../theme/colors";

type ButtonVariant = "primary" | "outline";

type ButtonProps = {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  variant?: ButtonVariant;
  fullWidth?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  variant = "primary",
  fullWidth = false,
  disabled = false,
  style,
}: ButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        variant === "primary" ? styles.primary : styles.outline,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          variant === "outline" && styles.textOutline,
          disabled && styles.textDisabled,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  primary: {
    backgroundColor: colors.primary,
  },

  outline: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: colors.border,
  },

  disabled: {
    opacity: 0.6,
  },

  fullWidth: {
    alignSelf: "stretch",
  },

  text: {
    fontSize: 14,
    fontWeight: "500",
    color: colors.primaryForeground,
  },

  textOutline: {
    color: colors.foreground,
  },

  textDisabled: {
    color: colors.mutedForeground,
  },
});
