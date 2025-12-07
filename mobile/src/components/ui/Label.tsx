import { Text, StyleSheet, View } from "react-native";
import { colors } from "../../theme/colors";

type LabelProps = {
  children: string;
};

export function Label({ children }: LabelProps) {
  return <Text style={styles.label}>{children}</Text>;
}

const styles = StyleSheet.create({
  label: {
    color: colors.mutedForeground,
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 6,
  },
});
