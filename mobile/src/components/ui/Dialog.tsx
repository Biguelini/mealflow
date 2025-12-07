import { ReactNode } from "react";
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { colors } from "../../theme/colors";
import { Button } from "./Button";

type DialogProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function Dialog({
  visible,
  onClose,
  title,
  description,
  children,
  footer,
}: DialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.overlay}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable style={styles.backdrop} onPress={onClose} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            {description && (
              <Text style={styles.description}>{description}</Text>
            )}
          </View>
          <ScrollView style={styles.body}>{children}</ScrollView>
          {footer && <View style={styles.footer}>{footer}</View>}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type ConfirmDialogProps = {
  visible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: "primary" | "outline";
  loading?: boolean;
};

export function ConfirmDialog({
  visible,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  confirmVariant = "primary",
  loading = false,
}: ConfirmDialogProps) {
  return (
    <Dialog
      visible={visible}
      onClose={onClose}
      title={title}
      footer={
        <View style={styles.confirmFooter}>
          <Button
            title={cancelText}
            variant="outline"
            onPress={onClose}
            style={styles.footerButton}
          />
          <Button
            title={loading ? "..." : confirmText}
            variant={confirmVariant}
            onPress={onConfirm}
            disabled={loading}
            style={styles.footerButton}
          />
        </View>
      }
    >
      <Text style={styles.confirmMessage}>{message}</Text>
    </Dialog>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  content: {
    backgroundColor: colors.card,
    borderRadius: 16,
    width: "90%",
    maxWidth: 400,
    maxHeight: "80%",
    overflow: "hidden",
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    color: colors.foreground,
    fontSize: 18,
    fontWeight: "600",
  },
  description: {
    color: colors.mutedForeground,
    fontSize: 13,
    marginTop: 4,
  },
  body: {
    padding: 20,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  confirmFooter: {
    flexDirection: "row",
    gap: 12,
  },
  footerButton: {
    flex: 1,
  },
  confirmMessage: {
    color: colors.foreground,
    fontSize: 14,
    lineHeight: 20,
  },
});
