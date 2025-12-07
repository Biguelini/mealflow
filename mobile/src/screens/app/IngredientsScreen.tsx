import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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
  Dialog,
} from "../../components/ui";
import type { Ingredient, IngredientFormState } from "../../types";

export function IngredientsScreen() {
  const { isOwner } = useHousehold();
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formDialog = useFormDialog<Ingredient>();
  const [form, setForm] = useState<IngredientFormState>({
    name: "",
    default_unit: "",
  });

  async function loadIngredients() {
    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<Ingredient[]>("/ingredients", {
        method: "GET",
      });
      setIngredients(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro ao carregar ingredientes.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIngredients();
  }, []);

  function openCreateDialog() {
    setForm({ name: "", default_unit: "" });
    formDialog.open();
  }

  function openEditDialog(ingredient: Ingredient) {
    setForm({
      id: ingredient.id,
      name: ingredient.name,
      default_unit: ingredient.default_unit || "",
    });
    formDialog.open(ingredient);
  }

  async function handleSave() {
    if (!form.name.trim()) {
      formDialog.setError("Nome é obrigatório.");
      return;
    }

    formDialog.setSaving(true);
    formDialog.setError(null);

    try {
      const payload = {
        name: form.name,
        default_unit: form.default_unit || null,
      };

      if (form.id) {
        await apiFetch(`/ingredients/${form.id}`, {
          method: "PUT",
          data: payload,
        });
      } else {
        await apiFetch("/ingredients", {
          method: "POST",
          data: payload,
        });
      }

      formDialog.close();
      await loadIngredients();
    } catch (err: any) {
      console.error(err);
      formDialog.setError(err.message ?? "Erro ao salvar ingrediente.");
    } finally {
      formDialog.setSaving(false);
    }
  }

  async function handleDelete(ingredient: Ingredient) {
    try {
      await apiFetch(`/ingredients/${ingredient.id}`, {
        method: "DELETE",
      });
      await loadIngredients();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro ao excluir ingrediente.");
    }
  }

  const renderItem = ({ item }: { item: Ingredient }) => (
    <Card style={styles.itemCard}>
      <CardContent style={styles.itemContent}>
        <View style={styles.itemInfo}>
          <Text style={styles.itemName}>{item.name}</Text>
          {item.default_unit && (
            <Text style={styles.itemUnit}>Unidade: {item.default_unit}</Text>
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

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.container}>
        <View style={styles.header}>
          <PageHeader
            title="Ingredientes"
            description="Gerencie os ingredientes disponíveis"
            action={
              isOwner && (
                <Button title="+ Novo" onPress={openCreateDialog} />
              )
            }
          />
        </View>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {loading && <LoadingState message="Carregando ingredientes..." />}

        {!loading && ingredients.length === 0 && (
          <EmptyState
            title="Nenhum ingrediente cadastrado"
            description="Crie seu primeiro ingrediente para começar"
            action={isOwner && <Button title="+ Novo Ingrediente" onPress={openCreateDialog} />}
          />
        )}

        {!loading && ingredients.length > 0 && (
          <FlatList
            data={ingredients}
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
        title={formDialog.editingItem ? "Editar Ingrediente" : "Novo Ingrediente"}
        description={
          formDialog.editingItem
            ? "Atualize as informações do ingrediente"
            : "Adicione um novo ingrediente"
        }
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
        <Input
          label="Nome"
          placeholder="Ex: Arroz"
          value={form.name}
          onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
        />
        <Input
          label="Unidade padrão"
          placeholder="Ex: kg, g, unidade"
          value={form.default_unit}
          onChangeText={(text) =>
            setForm((prev) => ({ ...prev, default_unit: text }))
          }
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
  itemContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 0,
    paddingVertical: 4,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    color: colors.foreground,
    fontSize: 15,
    fontWeight: "600",
  },
  itemUnit: {
    color: colors.mutedForeground,
    fontSize: 13,
    marginTop: 2,
  },
  itemActions: {
    flexDirection: "row",
    gap: 8,
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
