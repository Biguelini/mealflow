import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import moment from "moment";
import { Pencil, Trash2 } from "lucide-react-native";
import { apiFetch } from "../../services/api";
import { useHousehold } from "../../hooks/useHousehold";
import { useFormDialog } from "../../hooks/useFormDialog";
import { colors } from "../../theme/colors";
import {
  Card,
  CardContent,
} from "../../components/ui/Card";
import {
  PageHeader,
  LoadingState,
  ErrorMessage,
  EmptyState,
  Button,
  Input,
  Select,
  Dialog,
  Badge,
} from "../../components/ui";
import type { PantryItem, PantryFormState, Ingredient } from "../../types";

type StatusInfo = {
  label: string;
  variant: "success" | "warning" | "destructive" | "muted";
};

function computeStatus(expiresAt: string | null): StatusInfo {
  if (!expiresAt) {
    return { label: "Sem validade", variant: "muted" };
  }

  const today = moment().startOf("day");
  const exp = moment(expiresAt, "YYYY-MM-DD").startOf("day");
  const diffDays = exp.diff(today, "days");

  if (diffDays < 0) {
    return { label: "Vencido", variant: "destructive" };
  }

  if (diffDays <= 3) {
    return {
      label: diffDays === 0 ? "Vence hoje" : `Vence em ${diffDays} dia(s)`,
      variant: "warning",
    };
  }

  return { label: "OK", variant: "success" };
}

export function PantryScreen() {
  const { currentHousehold, isOwner } = useHousehold();
  const [items, setItems] = useState<PantryItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formDialog = useFormDialog<PantryItem>();
  const [form, setForm] = useState<PantryFormState>({
    ingredientId: "",
    quantity: "",
    expiresAt: "",
    notes: "",
  });

  async function loadIngredients() {
    try {
      const data = await apiFetch<Ingredient[]>("/ingredients", {
        method: "GET",
      });
      setIngredients(data);
    } catch (err) {
      console.error("Failed to load ingredients", err);
    }
  }

  async function loadPantry() {
    if (!currentHousehold?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<PantryItem[]>("/pantry/search", {
        method: "POST",
        data: {
          household_id: currentHousehold?.id,
        },
      });
      setItems(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro ao carregar despensa.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    loadPantry();
  }, [currentHousehold?.id]);

  function openCreateDialog() {
    setForm({
      id: undefined,
      ingredientId: "",
      quantity: "",
      expiresAt: "",
      notes: "",
    });
    formDialog.open();
  }

  function openEditDialog(item: PantryItem) {
    setForm({
      id: item.id,
      ingredientId: String(item.ingredient_id),
      quantity: item.quantity ?? "",
      expiresAt: item.expires_at ?? "",
      notes: item.notes ?? "",
    });
    formDialog.open(item);
  }

  async function handleSave() {
    if (!form.ingredientId) {
      formDialog.setError("Selecione um ingrediente.");
      return;
    }
    if (!form.quantity) {
      formDialog.setError("Informe a quantidade.");
      return;
    }

    formDialog.setSaving(true);
    formDialog.setError(null);

    try {
      const selectedIngredient = ingredients.find(
        (ing) => String(ing.id) === form.ingredientId
      );

      const payload = {
        household_id: currentHousehold?.id,
        ingredient_id: Number(form.ingredientId),
        quantity: Number(form.quantity),
        unit: selectedIngredient?.default_unit || null,
        expires_at: form.expiresAt || null,
        notes: form.notes || null,
      };

      if (form.id) {
        await apiFetch(`/pantry/${form.id}`, {
          method: "PUT",
          data: payload,
        });
      } else {
        await apiFetch("/pantry", {
          method: "POST",
          data: payload,
        });
      }

      formDialog.close();
      await loadPantry();
    } catch (err: any) {
      console.error(err);
      formDialog.setError(err.message ?? "Erro ao salvar item.");
    } finally {
      formDialog.setSaving(false);
    }
  }

  async function handleDelete(item: PantryItem) {
    try {
      await apiFetch(`/pantry/${item.id}`, {
        method: "DELETE",
      });
      await loadPantry();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro ao remover item.");
    }
  }

  const ingredientOptions = useMemo(
    () =>
      ingredients.map((ing) => ({
        label: ing.name,
        value: String(ing.id),
      })),
    [ingredients]
  );

  const renderItem = ({ item }: { item: PantryItem }) => {
    const status = computeStatus(item.expires_at);

    const cardStyle = [
      styles.itemCard,
      status.variant === "destructive" ? styles.expiredCard : undefined,
      status.variant === "warning" ? styles.warningCard : undefined,
    ].filter(Boolean) as ViewStyle[];

    return (
      <Card style={StyleSheet.flatten(cardStyle)}>
        <CardContent style={styles.itemContent}>
          <View style={styles.itemInfo}>
            <View style={styles.itemHeader}>
              <Text style={styles.itemName}>{item.ingredient.name}</Text>
              <Badge variant={status.variant}>{status.label}</Badge>
            </View>
            <Text style={styles.itemQty}>
              {Number(item.quantity).toLocaleString("pt-BR", {
                maximumFractionDigits: 2,
              })}{" "}
              {item.unit || item.ingredient.default_unit || ""}
            </Text>
            {item.expires_at && (
              <Text style={styles.itemExpiry}>
                Validade: {moment(item.expires_at).format("DD/MM/YYYY")}
              </Text>
            )}
            {item.notes && (
              <Text style={styles.itemNotes} numberOfLines={1}>
                {item.notes}
              </Text>
            )}
          </View>
          {isOwner && (
            <View style={styles.itemActions}>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => openEditDialog(item)}
              >
                <Pencil size={16} color={colors.mutedForeground} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionBtn}
                onPress={() => handleDelete(item)}
              >
                <Trash2 size={16} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <PageHeader
            title="Despensa"
            description="Acompanhe o que você tem em casa"
            action={
              isOwner && <Button title="+ Adicionar" onPress={openCreateDialog} />
            }
          />
        </View>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {loading && <LoadingState message="Carregando despensa..." />}

        {!loading && items.length === 0 && (
          <EmptyState
            title="Despensa vazia"
            description="Adicione o primeiro item para começar"
            action={
              isOwner && (
                <Button title="+ Adicionar Item" onPress={openCreateDialog} />
              )
            }
          />
        )}

        {!loading && items.length > 0 && (
          <FlatList
            data={items}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderItem}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Dialog
        visible={formDialog.isOpen}
        onClose={formDialog.close}
        title={formDialog.editingItem ? "Editar Item" : "Novo Item"}
        description="Preencha os dados do item da despensa"
        footer={
          <View style={styles.dialogFooter}>
            <Button
              title="Cancelar"
              variant="outline"
              onPress={formDialog.close}
              style={styles.dialogBtn}
            />
            <Button
              title={formDialog.isSaving ? "Salvando..." : "Salvar"}
              onPress={handleSave}
              disabled={formDialog.isSaving}
              style={styles.dialogBtn}
            />
          </View>
        }
      >
        {formDialog.error && (
          <ErrorMessage
            message={formDialog.error}
            onDismiss={() => formDialog.setError(null)}
          />
        )}
        <Select
          label="Ingrediente"
          placeholder="Selecione o ingrediente"
          value={form.ingredientId}
          onValueChange={(value) =>
            setForm((prev) => ({ ...prev, ingredientId: value }))
          }
          options={ingredientOptions}
        />
        <Input
          label="Quantidade"
          placeholder="Ex: 500"
          value={form.quantity}
          onChangeText={(text) => setForm((prev) => ({ ...prev, quantity: text }))}
          keyboardType="numeric"
        />
        <Input
          label="Data de validade (YYYY-MM-DD)"
          placeholder="Ex: 2024-12-31"
          value={form.expiresAt}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, expiresAt: text }))
          }
        />
        <Input
          label="Notas"
          placeholder="Observações opcionais"
          value={form.notes}
          onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
        />
      </Dialog>
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
  header: {
    marginBottom: 8,
  },
  list: {
    paddingBottom: 100,
  },
  itemCard: {
    marginBottom: 10,
  },
  expiredCard: {
    borderColor: colors.destructive + "60",
    backgroundColor: colors.destructive + "10",
  },
  warningCard: {
    borderColor: "#eab308" + "60",
    backgroundColor: "#eab308" + "10",
  },
  itemContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    marginTop: 0,
    paddingVertical: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
    marginBottom: 4,
  },
  itemName: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },
  itemQty: {
    color: colors.foreground,
    fontSize: 14,
    marginTop: 2,
  },
  itemExpiry: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  itemNotes: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
    fontStyle: "italic",
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
    marginLeft: 8,
  },
  actionBtn: {
    padding: 8,
  },
  actionIcon: {
    fontSize: 16,
  },
  dialogFooter: {
    flexDirection: "row",
    gap: 12,
  },
  dialogBtn: {
    flex: 1,
  },
});
