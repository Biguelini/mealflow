import { useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useAuth } from "../../hooks/useAuth";
import { colors } from "../../theme/colors";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";

export function LoginScreen() {
  const { login } = useAuth();

  const [email, setEmail] = useState("demo@mealflow.dev");
  const [password, setPassword] = useState("123456");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    await login(email, password);
    setLoading(false);
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.center}>
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Entrar</CardTitle>
            <CardDescription>
              Acesse seu painel MealFlow para planejar suas refeições.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <View style={styles.field}>
              <Text style={styles.label}>E-mail</Text>
              <TextInput
                style={styles.input}
                placeholder="seu@email.com"
                placeholderTextColor={colors.mutedForeground}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Senha</Text>
              <TextInput
                style={styles.input}
                placeholder="••••••••"
                placeholderTextColor={colors.mutedForeground}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            <Button
              title={loading ? "Entrando..." : "Entrar"}
              onPress={handleLogin}
              fullWidth
              disabled={loading}
            />
          </CardContent>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "100%",
    maxWidth: 380,
  },
  field: {
    marginBottom: 12,
  },
  label: {
    color: colors.mutedForeground,
    fontSize: 13,
    marginBottom: 4,
  },
  input: {
    backgroundColor: colors.background,
    borderRadius: 10,
    paddingHorizontal: 14,
    height: 44,
    color: colors.foreground,
    borderWidth: 1,
    borderColor: colors.border,
    fontSize: 14,
  },
});
