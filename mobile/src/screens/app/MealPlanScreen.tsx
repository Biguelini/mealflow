import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import moment, { type Moment } from "moment";
import { ChevronLeft, ChevronRight, CalendarDays, X } from "lucide-react-native";
import { apiFetch } from "../../services/api";
import { useHousehold } from "../../hooks/useHousehold";
import { colors } from "../../theme/colors";
import {
  Card,
  CardContent,
} from "../../components/ui/Card";
import {
  PageHeader,
  LoadingState,
  ErrorMessage,
  Button,
  Select,
} from "../../components/ui";
import type { Recipe, MealPlan, MealType } from "../../types";

type CellMap = Record<string, number[]>;

const makeKey = (dateStr: string, mealTypeId: number) => `${dateStr}::${mealTypeId}`;

const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

export function MealPlanScreen() {
  const { currentHousehold, isOwner } = useHousehold();
  const [weekStart, setWeekStart] = useState<Moment>(() =>
    moment().startOf("isoWeek")
  );
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [mealPlanId, setMealPlanId] = useState<number | null>(null);
  const [cells, setCells] = useState<CellMap>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, "day")),
    [weekStart]
  );

  const weekLabel = useMemo(() => {
    const year = weekStart.isoWeekYear();
    const week = String(weekStart.isoWeek()).padStart(2, "0");
    return `${year}-W${week}`;
  }, [weekStart]);

  const weekRangeLabel = useMemo(() => {
    const end = moment(weekStart).add(6, "day");
    return `${weekStart.format("DD MMM")} – ${end.format("DD MMM")}`;
  }, [weekStart]);

  const isCurrentWeek = useMemo(() => {
    const now = moment().startOf("isoWeek");
    return weekStart.isSame(now, "day");
  }, [weekStart]);

  async function loadRecipes() {
    if (!currentHousehold?.id) return;
    try {
      const response = await apiFetch<{ data: Recipe[] } | Recipe[]>("/recipes/search", {
        method: "POST",
        data: { household_id: currentHousehold?.id, q: null },
      });
      const data = Array.isArray(response) ? response : (response?.data ?? []);
      setRecipes(data);
    } catch (err) {
      console.error("Failed to load recipes", err);
    }
  }

  async function loadMealTypes() {
    if (!currentHousehold?.id) return;
    try {
      const response = await apiFetch<MealType[] | { data: MealType[] }>("/meal-types", {
        method: "GET",
        params: { household_id: currentHousehold?.id },
      });
      const data = Array.isArray(response) ? response : (response?.data ?? []);
      setMealTypes(data);
    } catch (err) {
      console.error("Failed to load meal types", err);
      setMealTypes([]);
    }
  }

  async function loadMealPlan() {
    if (!currentHousehold?.id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<MealPlan>("/meal-plans/search", {
        method: "POST",
        data: { household_id: currentHousehold?.id, week: weekLabel },
      });

      setMealPlanId(data?.id ?? null);
      const nextCells: CellMap = {};

      const items = data?.items ?? [];
      items.forEach((item) => {
        const dateStr = item.date.split("T")[0];
        const mealTypeId = item.meal_type_id || 0;
        const key = makeKey(dateStr, mealTypeId);

        if (!nextCells[key]) {
          nextCells[key] = [];
        }
        nextCells[key].push(item.recipe_id);
      });

      setCells(nextCells);
    } catch (err: any) {
      const message = err?.message ?? "";
      if (message.toLowerCase().includes("nenhum plano")) {
        setMealPlanId(null);
        setCells({});
        setError(null);
      } else {
        console.error(err);
        setMealPlanId(null);
        setCells({});
        setError(message || "Erro ao carregar plano da semana.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentHousehold?.id) {
      loadRecipes();
      loadMealTypes();
    }
  }, [currentHousehold?.id]);

  useEffect(() => {
    loadMealPlan();
  }, [weekLabel, currentHousehold?.id]);

  function handleChangeCell(day: Moment, mealTypeId: number, recipeIds: number[]) {
    const dateStr = day.format("YYYY-MM-DD");
    const key = makeKey(dateStr, mealTypeId);

    setCells((prev) => ({
      ...prev,
      [key]: recipeIds.filter((id) => id > 0),
    }));
  }

  function goToOtherWeek(delta: number) {
    setWeekStart((prev) => moment(prev).add(delta, "week").startOf("isoWeek"));
  }

  function goToCurrentWeek() {
    setWeekStart(moment().startOf("isoWeek"));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);

    try {
      const weekStartStr = weekStart.format("YYYY-MM-DD");
      const itemsPayload: {
        date: string;
        meal_type_id: number;
        recipe_id: number;
      }[] = [];

      Object.entries(cells).forEach(([key, recipeIds]) => {
        if (!recipeIds || recipeIds.length === 0) return;
        const [date, mealTypeIdStr] = key.split("::");
        const mealTypeId = Number(mealTypeIdStr);

        recipeIds.forEach((recipeId) => {
          itemsPayload.push({
            date,
            meal_type_id: mealTypeId,
            recipe_id: recipeId,
          });
        });
      });

      const payload = {
        household_id: currentHousehold?.id,
        week_start: weekStartStr,
        name: `Semana ${weekLabel}`,
        notes: null,
        items: itemsPayload,
      };

      if (mealPlanId) {
        await apiFetch(`/meal-plans/${mealPlanId}`, {
          method: "PUT",
          data: payload,
        });
      } else {
        const created = await apiFetch<MealPlan>("/meal-plans", {
          method: "POST",
          data: payload,
        });
        setMealPlanId(created.id);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro ao salvar plano semanal.");
    } finally {
      setSaving(false);
    }
  }

  const recipeOptions = useMemo(
    () => recipes.map((r) => ({ label: r.name, value: String(r.id) })),
    [recipes]
  );

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <PageHeader
          title="Plano Semanal"
          description="Organize suas refeições da semana"
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

        {isOwner && (
          <Button
            title={saving ? "Salvando..." : "Salvar Plano"}
            onPress={handleSave}
            disabled={saving}
            fullWidth
            style={{ marginBottom: 16 }}
          />
        )}

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {loading && <LoadingState message="Carregando plano..." />}

        {!loading && (
          <View style={styles.daysGrid}>
            {days.map((day, dayIdx) => {
              const isToday = day.isSame(moment(), "day");
              const dateStr = day.format("YYYY-MM-DD");

              const cardStyle = StyleSheet.flatten([
                styles.dayCard,
                isToday ? styles.todayCard : undefined,
              ].filter(Boolean));

              return (
                <Card
                  key={dateStr}
                  style={cardStyle}
                >
                  <View
                    style={[
                      styles.dayHeader,
                      isToday && styles.todayHeader,
                    ]}
                  >
                    <Text
                      style={[
                        styles.dayName,
                        isToday && styles.todayText,
                      ]}
                    >
                      {dayNames[dayIdx]}
                    </Text>
                    <Text
                      style={[
                        styles.dayDate,
                        isToday && styles.todayText,
                      ]}
                    >
                      {day.format("DD/MM")}
                    </Text>
                  </View>

                  <CardContent style={styles.dayContent}>
                    {mealTypes.map((mealType) => {
                      const key = makeKey(dateStr, mealType.id);
                      const recipeIds = cells[key] || [];

                      return (
                        <View key={mealType.id} style={styles.mealTypeSection}>
                          <Text style={styles.mealTypeName}>
                            {mealType.name}
                          </Text>

                          {recipeIds.map((recipeId, idx) => {
                            const recipe = recipes.find(
                              (r) => r.id === recipeId
                            );
                            return (
                              <View key={idx} style={styles.recipeChip}>
                                <Text
                                  style={styles.recipeChipText}
                                  numberOfLines={1}
                                >
                                  {recipe?.name || "?"}
                                </Text>
                                {isOwner && (
                                  <TouchableOpacity
                                    onPress={() => {
                                      const newIds = recipeIds.filter(
                                        (_, i) => i !== idx
                                      );
                                      handleChangeCell(day, mealType.id, newIds);
                                    }}
                                    style={styles.removeChip}
                                  >
                                    <X size={12} color={colors.destructive} />
                                  </TouchableOpacity>
                                )}
                              </View>
                            );
                          })}

                          {isOwner && (
                            <Select
                              placeholder="+ Adicionar"
                              value=""
                              onValueChange={(recipeIdStr) => {
                                const recipeId = Number(recipeIdStr);
                                if (recipeId > 0) {
                                  handleChangeCell(day, mealType.id, [
                                    ...recipeIds,
                                    recipeId,
                                  ]);
                                }
                              }}
                              options={recipeOptions.filter(
                                (r) => !recipeIds.includes(Number(r.value))
                              )}
                            />
                          )}

                          {!isOwner && recipeIds.length === 0 && (
                            <Text style={styles.noRecipeText}>
                              Nenhuma receita
                            </Text>
                          )}
                        </View>
                      );
                    })}

                    {mealTypes.length === 0 && (
                      <Text style={styles.noMealTypesText}>
                        Configure os tipos de refeição nas configurações
                      </Text>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </View>
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
    marginBottom: 16,
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
  daysGrid: {
    gap: 12,
  },
  dayCard: {
    marginBottom: 0,
  },
  todayCard: {
    borderColor: colors.primary,
  },
  dayHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.muted,
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    marginTop: -16,
    marginHorizontal: -16,
    marginBottom: 8,
  },
  todayHeader: {
    backgroundColor: colors.primary,
  },
  dayName: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  dayDate: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  todayText: {
    color: colors.primaryForeground,
  },
  dayContent: {
    marginTop: 0,
    gap: 12,
  },
  mealTypeSection: {
    gap: 6,
  },
  mealTypeName: {
    color: colors.mutedForeground,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  recipeChip: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.primary + "20",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  recipeChipText: {
    flex: 1,
    color: colors.primary,
    fontSize: 13,
    fontWeight: "500",
  },
  removeChip: {
    marginLeft: 8,
    padding: 2,
  },
  removeChipText: {
    color: colors.destructive,
    fontSize: 12,
    fontWeight: "600",
  },
  noRecipeText: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontStyle: "italic",
  },
  noMealTypesText: {
    color: colors.mutedForeground,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 16,
  },
});
