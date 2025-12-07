import { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Pencil, Trash2, Plus, X } from "lucide-react-native";
import { apiFetch } from "../../services/api";
import { useHousehold } from "../../hooks/useHousehold";
import { useFormDialog } from "../../hooks/useFormDialog";
import { colors } from "../../theme/colors";
import {
  Card,
  CardHeader,
  CardTitle,
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
import type { Recipe, Ingredient, RecipeFormState } from "../../types";

export function RecipesScreen() {
  const { currentHousehold, isOwner } = useHousehold();
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const formDialog = useFormDialog<Recipe>();
  const [form, setForm] = useState<RecipeFormState>({
    name: "",
    description: "",
    tagsText: "",
    ingredients: [{ ingredientId: "", quantity: "", unit: "" }],
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

  async function loadRecipes() {
    try {
      setLoading(true);
      setError(null);
      const response = await apiFetch<{ data: Recipe[] } | Recipe[]>("/recipes/search", {
        method: "POST",
        data: {
          household_id: currentHousehold?.id,
          q: search || null,
        },
      });
      // Handle both { data: [...] } and direct array responses
      const data = Array.isArray(response) ? response : (response?.data ?? []);
      setRecipes(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro ao carregar receitas.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadIngredients();
  }, []);

  useEffect(() => {
    if (currentHousehold?.id) {
      loadRecipes();
    }
  }, [search, currentHousehold?.id]);

  function openCreateDialog() {
    setForm({
      id: undefined,
      name: "",
      description: "",
      tagsText: "",
      ingredients: [{ ingredientId: "", quantity: "", unit: "" }],
    });
    formDialog.open();
  }

  function openEditDialog(recipe: Recipe) {
    setForm({
      id: recipe.id,
      name: recipe.name,
      description: recipe.description ?? "",
      tagsText: (recipe.tags ?? []).join(", "),
      ingredients:
        recipe.ingredients?.map((ing) => ({
          ingredientId: String(ing.id),
          quantity: ing.pivot.quantity ?? "",
          unit: ing.pivot.unit ?? "",
        })) ?? [{ ingredientId: "", quantity: "", unit: "" }],
    });
    formDialog.open(recipe);
  }

  function handleChangeIngredient(
    index: number,
    field: "ingredientId" | "quantity" | "unit",
    value: string
  ) {
    setForm((prev) => {
      const nextIngredients = [...prev.ingredients];
      nextIngredients[index] = {
        ...nextIngredients[index],
        [field]: value,
      };
      return { ...prev, ingredients: nextIngredients };
    });
  }

  function addIngredientRow() {
    setForm((prev) => ({
      ...prev,
      ingredients: [
        ...prev.ingredients,
        { ingredientId: "", quantity: "", unit: "" },
      ],
    }));
  }

  function removeIngredientRow(index: number) {
    setForm((prev) => {
      const nextIngredients = prev.ingredients.filter((_, i) => i !== index);
      return {
        ...prev,
        ingredients:
          nextIngredients.length > 0
            ? nextIngredients
            : [{ ingredientId: "", quantity: "", unit: "" }],
      };
    });
  }

  async function handleSave() {
    if (!form.name.trim()) {
      formDialog.setError("Nome da receita é obrigatório.");
      return;
    }

    formDialog.setSaving(true);
    formDialog.setError(null);

    try {
      const tags = form.tagsText
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const ingredientsPayload = form.ingredients
        .filter((row) => row.ingredientId)
        .map((row) => ({
          ingredient_id: Number(row.ingredientId),
          quantity: row.quantity ? Number(row.quantity) : null,
          unit: row.unit || null,
        }));

      const payload = {
        household_id: currentHousehold?.id,
        name: form.name,
        description: form.description || null,
        instructions: null,
        servings: null,
        is_public: false,
        tags,
        ingredients: ingredientsPayload,
      };

      if (form.id) {
        await apiFetch(`/recipes/${form.id}`, {
          method: "PUT",
          data: payload,
        });
      } else {
        await apiFetch("/recipes", {
          method: "POST",
          data: payload,
        });
      }

      formDialog.close();
      await loadRecipes();
    } catch (err: any) {
      console.error(err);
      formDialog.setError(err.message ?? "Erro ao salvar receita.");
    } finally {
      formDialog.setSaving(false);
    }
  }

  async function handleDelete(recipe: Recipe) {
    try {
      await apiFetch(`/recipes/${recipe.id}`, {
        method: "DELETE",
      });
      await loadRecipes();
    } catch (err: any) {
      console.error(err);
      setError(err.message ?? "Erro ao excluir receita.");
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

  const renderRecipe = ({ item }: { item: Recipe }) => {
    const tags = item.tags ?? [];
    const recipeIngredients = item.ingredients ?? [];

    return (
      <Card style={styles.recipeCard}>
        <CardHeader>
          <View style={styles.recipeHeader}>
            <CardTitle style={styles.recipeName}>{item.name}</CardTitle>
            {isOwner && (
              <View style={styles.recipeActions}>
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
          </View>
          {item.description && (
            <Text style={styles.recipeDesc} numberOfLines={2}>
              {item.description}
            </Text>
          )}
        </CardHeader>
        <CardContent>
          {tags.length > 0 && (
            <View style={styles.tagsRow}>
              {tags.map((tag, idx) => (
                <Badge key={idx} variant="muted">
                  {tag}
                </Badge>
              ))}
            </View>
          )}
          {recipeIngredients.length > 0 && (
            <View style={styles.ingredientsList}>
              <Text style={styles.ingredientsTitle}>Ingredientes:</Text>
              {recipeIngredients.map((ing) => (
                <Text key={ing.id} style={styles.ingredientItem}>
                  • {ing.name}
                  {ing.pivot?.quantity && ` - ${ing.pivot.quantity}`}
                  {ing.pivot?.unit && ` ${ing.pivot.unit}`}
                </Text>
              ))}
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
            title="Receitas"
            description="Gerencie as receitas da sua casa"
            action={
              isOwner && <Button title="+ Nova" onPress={openCreateDialog} />
            }
          />
        </View>

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {loading && <LoadingState message="Carregando receitas..." />}

        {!loading && recipes.length === 0 && (
          <EmptyState
            title="Nenhuma receita encontrada"
            description="Crie a primeira receita para começar."
            action={
              isOwner && (
                <Button title="+ Nova Receita" onPress={openCreateDialog} />
              )
            }
          />
        )}

        {!loading && recipes.length > 0 && (
          <FlatList
            data={recipes}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderRecipe}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>

      <Dialog
        visible={formDialog.isOpen}
        onClose={formDialog.close}
        title={formDialog.editingItem ? "Editar Receita" : "Nova Receita"}
        description="Preencha os dados da receita"
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
        <ScrollView>
          {formDialog.error && (
            <ErrorMessage
              message={formDialog.error}
              onDismiss={() => formDialog.setError(null)}
            />
          )}
          <Input
            label="Nome"
            placeholder="Nome da receita"
            value={form.name}
            onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
          />
          <Input
            label="Descrição"
            placeholder="Descrição opcional"
            value={form.description}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, description: text }))
            }
          />
          <Input
            label="Tags (separadas por vírgula)"
            placeholder="Ex: almoço, rápido, saudável"
            value={form.tagsText}
            onChangeText={(text) =>
              setForm((prev) => ({ ...prev, tagsText: text }))
            }
          />

          <Text style={styles.sectionTitle}>Ingredientes</Text>
          {form.ingredients.map((row, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={styles.ingredientSelect}>
                <Select
                  placeholder="Ingrediente"
                  value={row.ingredientId}
                  onValueChange={(value) =>
                    handleChangeIngredient(index, "ingredientId", value)
                  }
                  options={ingredientOptions}
                />
              </View>
              <View style={styles.ingredientQty}>
                <Input
                  placeholder="Qtd"
                  value={row.quantity}
                  onChangeText={(value) =>
                    handleChangeIngredient(index, "quantity", value)
                  }
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.ingredientUnit}>
                <Input
                  placeholder="Un."
                  value={row.unit}
                  onChangeText={(value) =>
                    handleChangeIngredient(index, "unit", value)
                  }
                />
              </View>
              <TouchableOpacity
                style={styles.removeBtn}
                onPress={() => removeIngredientRow(index)}
              >
                <X size={16} color={colors.destructive} />
              </TouchableOpacity>
            </View>
          ))}
          <Button
            title="+ Adicionar Ingrediente"
            variant="outline"
            onPress={addIngredientRow}
          />
        </ScrollView>
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
  recipeCard: {
    marginBottom: 12,
  },
  recipeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  recipeName: {
    flex: 1,
    fontSize: 16,
  },
  recipeDesc: {
    color: colors.mutedForeground,
    fontSize: 13,
    marginTop: 4,
  },
  recipeActions: {
    flexDirection: "row",
    gap: 4,
  },
  actionBtn: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 14,
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 12,
  },
  ingredientsList: {
    marginTop: 8,
  },
  ingredientsTitle: {
    color: colors.mutedForeground,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 4,
  },
  ingredientItem: {
    color: colors.foreground,
    fontSize: 13,
    marginLeft: 4,
  },
  dialogFooter: {
    flexDirection: "row",
    gap: 12,
  },
  dialogBtn: {
    flex: 1,
  },
  sectionTitle: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
    marginTop: 16,
    marginBottom: 8,
  },
  ingredientRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    marginBottom: 8,
  },
  ingredientSelect: {
    flex: 2,
  },
  ingredientQty: {
    flex: 1,
  },
  ingredientUnit: {
    flex: 1,
  },
  removeBtn: {
    padding: 12,
    marginTop: 4,
  },
  removeBtnText: {
    color: colors.destructive,
    fontSize: 16,
    fontWeight: "600",
  },
});
