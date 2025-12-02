import { View, Text, StyleSheet } from "react-native";
import { AppShell } from "../../components/layout/AppShell";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/Card";
import { colors } from "../../theme/colors";

export function HomeScreen() {
  return (
    <AppShell>
      <View style={styles.grid}>
        <StatCard
          title="Refeições planejadas"
          value="0"
          description="Aqui depois mostra a semana atual."
        />

        <StatCard
          title="Receitas cadastradas"
          value="0"
          description="Dados virão da API de receitas."
        />

        <StatCard
          title="Listas de compras"
          value="0"
          description="Em breve, integração com listas."
        />
      </View>
    </AppShell>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent>
        <Text style={styles.number}>{value}</Text>
        <Text style={styles.caption}>{description}</Text>
      </CardContent>
    </Card>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },

  number: {
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 28,
    color: colors.foreground,
  },

  caption: {
    fontSize: 12,
    lineHeight: 16,
    color: colors.mutedForeground,
    marginTop: 4,
  },
});
