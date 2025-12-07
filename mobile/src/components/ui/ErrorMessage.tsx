import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { X } from "lucide-react-native";
import { colors } from "../../theme/colors";

type ErrorMessageProps = {
  message: string;
  onDismiss?: () => void;
};

export function ErrorMessage({ message, onDismiss }: ErrorMessageProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.message}>{message}</Text>
      {onDismiss && (
        <TouchableOpacity onPress={onDismiss} style={styles.dismissButton}>
          <X size={16} color={colors.destructive} />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.destructive + "15",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: colors.destructive + "40",
  },
  message: {
    color: colors.destructive,
    fontSize: 14,
    flex: 1,
  },
  dismissButton: {
    padding: 4,
    marginLeft: 8,
  },
  dismissText: {
    color: colors.destructive,
    fontSize: 16,
    fontWeight: "600",
  },
});
