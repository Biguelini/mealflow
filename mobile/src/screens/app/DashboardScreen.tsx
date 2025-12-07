import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import moment, { type Moment } from "moment";
import { SafeAreaView } from "react-native-safe-area-context";
import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react-native";
import { apiFetch } from "../../services/api";
import { useHousehold } from "../../hooks/useHousehold";
import { colors } from "../../theme/colors";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../../components/ui/Card";
import {
  PageHeader,
  LoadingState,
  ErrorMessage,
} from "../../components/ui";
import type { WeeklySummary } from "../../types";

moment.locale("pt-br");

export function DashboardScreen() {
  const { currentHousehold } = useHousehold();
  const [weekStart, setWeekStart] = useState<Moment>(() =>
    moment().startOf("isoWeek")
  );
  const [summary, setSummary] = useState<WeeklySummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const weekLabel = useMemo(() => {
    const year = weekStart.isoWeekYear();
    const week = String(weekStart.isoWeek()).padStart(2, "0");
    return `${year}-W${week}`;
  }, [weekStart]);

  const weekRangeLabel = useMemo(() => {
    const end = moment(weekStart).add(6, "day");
    return `${weekStart.format("DD MMM")} – ${end.format("DD MMM")}`;
  }, [weekStart]);

  function goToOtherWeek(delta: number) {
    setWeekStart((prev) => moment(prev).add(delta, "week").startOf("isoWeek"));
  }

  const isCurrentWeek = useMemo(() => {
    const now = moment().startOf("isoWeek");
    return weekStart.isSame(now, "day");
  }, [weekStart]);

  function goToCurrentWeek() {
    setWeekStart(moment().startOf("isoWeek"));
  }

  async function loadSummary() {
    if (!currentHousehold?.id) return;

    setLoading(true);
    setError(null);
    setSummary(null);

    try {
      const data = await apiFetch<WeeklySummary>("/dashboard/weekly-summary", {
        method: "POST",
        data: {
          household_id: currentHousehold?.id,
          week: weekLabel,
        },
      });
      setSummary(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro ao carregar dados do dashboard.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSummary();
  }, [weekLabel, currentHousehold?.id]);

  const planned = summary?.planned_meals ?? 0;
  const completed = summary?.completed_meals ?? 0;
  const completionPct = planned > 0 ? Math.round((completed / planned) * 100) : 0;
  const maxRecipeUsage = summary?.top_recipes?.[0]?.usage_count ?? 0;
  const maxIngredientUsage = summary?.top_ingredients?.[0]
    ? Number(summary.top_ingredients[0].total_quantity)
    : 0;

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <PageHeader
          title="Dashboard"
          description="Visão geral das suas refeições planejadas"
        />

        {/* Week Navigation */}
        <View style={styles.weekNav}>
          {!isCurrentWeek && (
            <TouchableOpacity style={styles.todayBtn} onPress={goToCurrentWeek}>
              <CalendarDays size={16} color={colors.primary} />
              <Text style={styles.todayBtnText}>Hoje</Text>
            </TouchableOpacity>
          )}
          <View style={styles.weekSelector}>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => goToOtherWeek(-1)}
            >
              <ChevronLeft size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={styles.weekLabel}>{weekRangeLabel}</Text>
            <TouchableOpacity
              style={styles.navBtn}
              onPress={() => goToOtherWeek(1)}
            >
              <ChevronRight size={20} color={colors.foreground} />
            </TouchableOpacity>
          </View>
        </View>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {loading && <LoadingState message="Carregando dados do dashboard..." />}

        {!loading && (
          <>
            {/* Stats Cards */}
            <View style={styles.statsGrid}>
              <Card style={styles.statCard}>
                <CardHeader>
                  <CardTitle style={styles.statTitle}>Refeições planejadas</CardTitle>
                  <CardDescription>Para a semana selecionada</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text style={styles.statValue}>{planned}</Text>
                </CardContent>
              </Card>

              <Card style={styles.statCard}>
                <CardHeader>
                  <CardTitle style={styles.statTitle}>Refeições realizadas</CardTitle>
                  <CardDescription>Considerando dias até hoje</CardDescription>
                </CardHeader>
                <CardContent>
                  <Text style={styles.statValue}>{completed}</Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${Math.min(completionPct, 100)}%` },
                      ]}
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {completionPct}% das refeições planejadas já aconteceram.
                  </Text>
                </CardContent>
              </Card>
            </View>

            {/* Top Recipes */}
            <Card style={styles.listCard}>
              <CardHeader>
                <CardTitle style={styles.statTitle}>Top 5 receitas mais usadas</CardTitle>
                <CardDescription>Na semana selecionada</CardDescription>
              </CardHeader>
              <CardContent>
                {summary && (summary.top_recipes?.length ?? 0) > 0 ? (
                  <View style={styles.rankList}>
                    {(summary.top_recipes ?? []).map((r) => {
                      const pct =
                        maxRecipeUsage > 0
                          ? (r.usage_count / maxRecipeUsage) * 100
                          : 0;
                      return (
                        <View key={r.recipe_id} style={styles.rankItem}>
                          <View style={styles.rankInfo}>
                            <Text style={styles.rankName} numberOfLines={1}>
                              {r.name}
                            </Text>
                            <Text style={styles.rankCount}>{r.usage_count}x</Text>
                          </View>
                          <View style={styles.rankBar}>
                            <View
                              style={[
                                styles.rankBarFill,
                                { width: `${pct || 5}%` },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>
                    Nenhuma receita usada nesta semana.
                  </Text>
                )}
              </CardContent>
            </Card>

            {/* Top Ingredients */}
            <Card style={styles.listCard}>
              <CardHeader>
                <CardTitle style={styles.statTitle}>
                  Ingredientes mais usados
                </CardTitle>
                <CardDescription>
                  Soma aproximada das quantidades da semana
                </CardDescription>
              </CardHeader>
              <CardContent>
                {summary && (summary.top_ingredients?.length ?? 0) > 0 ? (
                  <View style={styles.rankList}>
                    {(summary.top_ingredients ?? []).map((ing) => {
                      const total = Number(ing.total_quantity);
                      const pct =
                        maxIngredientUsage > 0
                          ? (total / maxIngredientUsage) * 100
                          : 0;
                      return (
                        <View key={ing.ingredient_id} style={styles.rankItem}>
                          <View style={styles.rankInfo}>
                            <Text style={styles.rankName} numberOfLines={1}>
                              {ing.name}
                            </Text>
                            <Text style={styles.rankCount}>
                              {total.toLocaleString("pt-BR", {
                                maximumFractionDigits: 1,
                              })}
                            </Text>
                          </View>
                          <View style={styles.rankBar}>
                            <View
                              style={[
                                styles.rankBarFill,
                                { width: `${pct || 5}%` },
                              ]}
                            />
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <Text style={styles.emptyText}>
                    Nenhum ingrediente usado nesta semana.
                  </Text>
                )}
              </CardContent>
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  weekNav: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    gap: 12,
  },
  todayBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  todayBtnText: {
    color: colors.foreground,
    fontSize: 12,
    fontWeight: "500",
  },
  weekSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  navBtn: {
    padding: 8,
  },
  navBtnText: {
    color: colors.foreground,
    fontSize: 14,
  },
  weekLabel: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 12,
    minWidth: 140,
    textAlign: "center",
  },
  statsGrid: {
    gap: 12,
    marginBottom: 16,
  },
  statCard: {
    marginBottom: 0,
  },
  statTitle: {
    fontSize: 14,
  },
  statValue: {
    color: colors.foreground,
    fontSize: 28,
    fontWeight: "700",
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.muted,
    borderRadius: 4,
    marginTop: 12,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 4,
  },
  progressText: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 6,
  },
  listCard: {
    marginBottom: 16,
  },
  rankList: {
    gap: 12,
  },
  rankItem: {
    gap: 6,
  },
  rankInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rankName: {
    color: colors.foreground,
    fontSize: 13,
    flex: 1,
    marginRight: 8,
  },
  rankCount: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  rankBar: {
    height: 6,
    backgroundColor: colors.muted,
    borderRadius: 3,
    overflow: "hidden",
  },
  rankBarFill: {
    height: "100%",
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 12,
  },
});
