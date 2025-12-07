import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import moment, { type Moment } from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
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
  Button,
  Input,
  Select,
  Badge,
} from "../../components/ui";
import type { ShoppingList, ShoppingListItem } from "../../types";

type ItemExtraState = {
  estimatedPrice: string;
  status: "pending" | "bought";
};

type ItemExtraMap = Record<number, ItemExtraState>;

function getExtrasStorageKey(shoppingListId: number) {
  return `shopping_list_extras_${shoppingListId}`;
}

async function loadExtrasFromStorage(shoppingListId: number): Promise<ItemExtraMap> {
  try {
    const raw = await AsyncStorage.getItem(getExtrasStorageKey(shoppingListId));
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveExtrasToStorage(shoppingListId: number, extras: ItemExtraMap) {
  await AsyncStorage.setItem(
    getExtrasStorageKey(shoppingListId),
    JSON.stringify(extras)
  );
}

export function ShoppingListScreen() {
  const { currentHousehold } = useHousehold();
  const [weekStart, setWeekStart] = useState<Moment>(() =>
    moment().startOf("isoWeek")
  );
  const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
  const [extras, setExtras] = useState<ItemExtraMap>({});
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
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

  useEffect(() => {
    async function loadExtras() {
      if (!shoppingList) return;
      const stored = await loadExtrasFromStorage(shoppingList.id);
      const next: ItemExtraMap = {};

      const items = shoppingList.items ?? [];
      items.forEach((item) => {
        const existing = stored[item.id];
        next[item.id] = existing ?? {
          estimatedPrice: "",
          status: "pending",
        };
      });

      setExtras(next);
    }

    loadExtras();
  }, [shoppingList]);

  async function loadShoppingList() {
    if (!currentHousehold?.id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await apiFetch<ShoppingList>("/shopping-lists/search", {
        method: "POST",
        data: {
          household_id: currentHousehold?.id,
          week: weekLabel,
        },
      });
      setShoppingList(data);
    } catch (err: any) {
      const message = err?.message ?? "";
      if (message.toLowerCase().includes("nenhuma lista")) {
        setShoppingList(null);
        setError(null);
      } else {
        console.error(err);
        setShoppingList(null);
        setError(message || "Erro ao carregar lista de compras.");
      }
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    setShoppingList(null);
    loadShoppingList();
  }, [weekLabel, currentHousehold?.id]);

  async function updateExtra(
    itemId: number,
    field: keyof ItemExtraState,
    value: string
  ) {
    if (!shoppingList) return;

    const current = extras[itemId] ?? {
      estimatedPrice: "",
      status: "pending",
    };
    const next: ItemExtraMap = {
      ...extras,
      [itemId]: {
        ...current,
        [field]: field === "status" ? (value as ItemExtraState["status"]) : value,
      },
    };

    setExtras(next);
    await saveExtrasToStorage(shoppingList.id, next);
  }

  async function generateListFromWeek() {
    if (!currentHousehold?.id) return;

    setGenerating(true);
    setError(null);
    setShoppingList(null);

    try {
      const mealPlan = await apiFetch<{ id: number }>("/meal-plans/search", {
        method: "POST",
        data: {
          household_id: currentHousehold?.id,
          week: weekLabel,
        },
      });

      const list = await apiFetch<ShoppingList>(
        `/shopping-lists/from-meal-plan/${mealPlan.id}`,
        { method: "POST" }
      );

      setShoppingList(list);
    } catch (err: any) {
      console.error(err);
      const message =
        err.message ??
        "Erro ao gerar lista de compras. Verifique se existe um plano de refeições para a semana.";
      setError(message);
    } finally {
      setGenerating(false);
    }
  }

  const totalEstimated = useMemo(() => {
    if (!shoppingList) return 0;
    return shoppingList.items.reduce((sum, item) => {
      const extra = extras[item.id];
      const val = extra?.estimatedPrice
        ? Number(extra.estimatedPrice.replace(",", "."))
        : 0;
      if (isNaN(val)) return sum;
      return sum + val;
    }, 0);
  }, [shoppingList, extras]);

  const statusOptions = [
    { label: "Pendente", value: "pending" },
    { label: "Comprado", value: "bought" },
  ];

  const renderItem = ({ item }: { item: ShoppingListItem }) => {
    const extra = extras[item.id] ?? {
      estimatedPrice: "",
      status: "pending" as const,
    };
    const isBought = extra.status === "bought";

    const cardStyle = StyleSheet.flatten([
      styles.itemCard,
      isBought ? styles.boughtCard : undefined,
    ].filter(Boolean));

    return (
      <Card style={cardStyle}>
        <CardContent style={styles.itemContent}>
          <View style={styles.itemInfo}>
            <Text
              style={[styles.itemName, isBought && styles.boughtText]}
              numberOfLines={1}
            >
              {item.ingredient.name}
            </Text>
            <Text style={styles.itemDetails}>
              Precisa:{" "}
              {Number(item.needed_quantity).toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
              })}{" "}
              {item.unit ?? ""} • Despensa:{" "}
              {Number(item.pantry_quantity).toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
              })}{" "}
              {item.unit ?? ""}
            </Text>
            <Text style={styles.itemToBuy}>
              Comprar:{" "}
              <Text style={styles.itemToBuyValue}>
                {Number(item.to_buy_quantity).toLocaleString("pt-BR", {
                  maximumFractionDigits: 2,
                })}{" "}
                {item.unit ?? ""}
              </Text>
            </Text>
          </View>

          <View style={styles.itemActions}>
            <Input
              placeholder="R$"
              value={extra.estimatedPrice}
              onChangeText={(text) =>
                updateExtra(item.id, "estimatedPrice", text)
              }
              keyboardType="numeric"
              style={styles.priceInput}
            />
            <Select
              value={extra.status}
              onValueChange={(value) => updateExtra(item.id, "status", value)}
              options={statusOptions}
            />
          </View>
        </CardContent>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <PageHeader
          title="Lista de Compras"
          description="Gere a lista com base no plano semanal"
        />

        {/* Week Navigation */}
        <View style={styles.weekNav}>
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

        <Button
          title={generating ? "Gerando..." : "Gerar lista da semana"}
          onPress={generateListFromWeek}
          disabled={generating}
          fullWidth
          style={{ marginBottom: 16 }}
        />

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {loading && <LoadingState message="Carregando lista de compras..." />}

        {!loading && !shoppingList && !error && (
          <Card>
            <CardHeader>
              <CardTitle>Nenhuma lista gerada ainda</CardTitle>
              <CardDescription>
                Gere uma lista com base no plano de refeições da semana selecionada.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {!loading && shoppingList && (
          <>
            <Card style={styles.summaryCard}>
              <CardHeader>
                <CardTitle style={styles.summaryTitle}>
                  {shoppingList.name}
                </CardTitle>
                <CardDescription>
                  {shoppingList.items.length} itens • Total estimado: R${" "}
                  {totalEstimated.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </CardDescription>
              </CardHeader>
            </Card>

            <FlatList
              data={shoppingList.items}
              keyExtractor={(item) => String(item.id)}
              renderItem={renderItem}
              contentContainerStyle={styles.list}
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </View>
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
    padding: 16,
  },
  weekNav: {
    alignItems: "center",
    marginBottom: 16,
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
  summaryCard: {
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 16,
  },
  list: {
    paddingBottom: 100,
  },
  itemCard: {
    marginBottom: 10,
  },
  boughtCard: {
    backgroundColor: "#22c55e" + "20",
    borderColor: "#22c55e" + "40",
  },
  itemContent: {
    marginTop: 0,
    paddingVertical: 4,
  },
  itemInfo: {
    marginBottom: 12,
  },
  itemName: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 4,
  },
  boughtText: {
    textDecorationLine: "line-through",
    opacity: 0.7,
  },
  itemDetails: {
    color: colors.mutedForeground,
    fontSize: 12,
  },
  itemToBuy: {
    color: colors.foreground,
    fontSize: 13,
    marginTop: 4,
  },
  itemToBuyValue: {
    fontWeight: "600",
    color: colors.primary,
  },
  itemActions: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  priceInput: {
    flex: 1,
    marginBottom: 0,
  },
});
