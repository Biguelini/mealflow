import { useState } from "react";
import {
  Text,
  TextInput,
  StyleSheet,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { UserPlus } from "lucide-react-native";
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

export function RegisterScreen() {
  const { register } = useAuth();
  const navigation = useNavigation<any>();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Preencha todos os campos.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await register(name, email, password);
    } catch (err: any) {
      setError(err.message ?? "Erro ao criar conta.");
    } finally {
      setLoading(false);
    }
  };

  const onNavigateToLogin = () => {
    navigation.navigate("Login");
  };

  return (
    <KeyboardAvoidingView
      style={styles.root}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={styles.center}>
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.logoContainer}>
              <View style={styles.logo}>
                <UserPlus size={32} color="#fff" />
              </View>
            </View>
            <CardTitle style={styles.titleCenter}>Criar Conta</CardTitle>
            <CardDescription style={styles.descCenter}>
              Comece a organizar refeições saudáveis para sua casa
            </CardDescription>
          </CardHeader>

          <CardContent>
            {error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.field}>
              <Text style={styles.label}>Nome</Text>
              <TextInput
                style={styles.input}
                placeholder="Seu nome"
                placeholderTextColor={colors.mutedForeground}
                value={name}
                onChangeText={setName}
              />
            </View>

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
              title={loading ? "Criando conta..." : "Criar conta"}
              onPress={handleRegister}
              fullWidth
              disabled={loading}
            />

            <View style={styles.linkContainer}>
              <Text style={styles.linkText}>Já tem conta? </Text>
              <TouchableOpacity onPress={onNavigateToLogin}>
                <Text style={styles.link}>Fazer login</Text>
              </TouchableOpacity>
            </View>
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
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  logoIcon: {
    fontSize: 32,
  },
  titleCenter: {
    textAlign: "center",
    fontSize: 20,
  },
  descCenter: {
    textAlign: "center",
  },
  errorBox: {
    backgroundColor: colors.destructive + "15",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.destructive,
    fontSize: 14,
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
  linkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  linkText: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
