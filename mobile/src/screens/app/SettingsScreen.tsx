import { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Sun,
  Moon,
  Monitor,
  ChevronUp,
  ChevronDown,
  Pencil,
  Trash2,
  LogOut,
} from "lucide-react-native";
import { apiFetch } from "../../services/api";
import { useHousehold } from "../../hooks/useHousehold";
import { useAuth } from "../../hooks/useAuth";
import { useTheme } from "../../context/ThemeContext";
import { useFormDialog } from "../../hooks/useFormDialog";
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
  Dialog,
  Badge,
} from "../../components/ui";
import type { MealType, MealTypeFormState } from "../../types";

export function SettingsScreen() {
  const { currentHousehold, isOwner } = useHousehold();
  const { logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [mealTypes, setMealTypes] = useState<MealType[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formDialog = useFormDialog<MealType>();
  const [formData, setFormData] = useState<MealTypeFormState>({ name: "" });

  async function loadMealTypes() {
    if (!currentHousehold?.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await apiFetch<MealType[]>("/meal-types", {
        method: "GET",
        params: { household_id: currentHousehold?.id },
      });
      setMealTypes(data);
    } catch (err: any) {
      setError(err.message || "Erro ao carregar tipos de refeição");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMealTypes();
  }, [currentHousehold?.id]);

  function openCreateDialog() {
    setFormData({ name: "" });
    formDialog.open();
  }

  function openEditDialog(mealType: MealType) {
    setFormData({
      id: mealType.id,
      name: mealType.name,
      order: mealType.order,
    });
    formDialog.open(mealType);
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      formDialog.setError("O nome da refeição é obrigatório");
      return;
    }

    try {
      formDialog.setSaving(true);
      formDialog.setError(null);

      if (formDialog.editingItem) {
        const updated = await apiFetch<MealType>(
          `/meal-types/${formDialog.editingItem.id}`,
          {
            method: "PUT",
            data: {
              name: formData.name,
              order: formData.order,
            },
          }
        );
        setMealTypes((prev) =>
          prev.map((mt) => (mt.id === updated.id ? updated : mt))
        );
      } else {
        const created = await apiFetch<MealType>("/meal-types", {
          method: "POST",
          data: {
            household_id: currentHousehold?.id,
            name: formData.name,
            order: formData.order,
          },
        });
        setMealTypes((prev) =>
          [...prev, created].sort((a, b) => a.order - b.order)
        );
      }

      formDialog.close();
      setFormData({ name: "" });
    } catch (err: any) {
      formDialog.setError(err.message || "Erro ao salvar tipo de refeição");
    } finally {
      formDialog.setSaving(false);
    }
  }

  async function handleDelete(mealType: MealType) {
    try {
      setError(null);
      await apiFetch(`/meal-types/${mealType.id}`, {
        method: "DELETE",
      });
      setMealTypes((prev) => prev.filter((mt) => mt.id !== mealType.id));
    } catch (err: any) {
      setError(err.message || "Erro ao excluir tipo de refeição");
    }
  }

  async function handleReorder(mealType: MealType, direction: "up" | "down") {
    const currentIndex = mealTypes.findIndex((mt) => mt.id === mealType.id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === mealTypes.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const swapMealType = mealTypes[newIndex];

    try {
      await Promise.all([
        apiFetch(`/meal-types/${mealType.id}`, {
          method: "PUT",
          data: { order: swapMealType.order },
        }),
        apiFetch(`/meal-types/${swapMealType.id}`, {
          method: "PUT",
          data: { order: mealType.order },
        }),
      ]);

      const newMealTypes = [...mealTypes];
      [newMealTypes[currentIndex], newMealTypes[newIndex]] = [
        newMealTypes[newIndex],
        newMealTypes[currentIndex],
      ];
      setMealTypes(newMealTypes);
    } catch (err: any) {
      setError(err.message || "Erro ao reordenar tipos de refeição");
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <PageHeader
          title="Configurações"
          description="Gerencie as configurações da sua household"
        />

        {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

        {/* Theme Card */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Aparência</CardTitle>
            <CardDescription>
              Personalize a aparência do aplicativo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.themeGrid}>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === "light" && styles.themeOptionActive,
                ]}
                onPress={() => setTheme("light")}
              >
                <Sun size={24} color={theme === "light" ? colors.primary : colors.mutedForeground} />
                <Text
                  style={[
                    styles.themeLabel,
                    theme === "light" && styles.themeLabelActive,
                  ]}
                >
                  Claro
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === "dark" && styles.themeOptionActive,
                ]}
                onPress={() => setTheme("dark")}
              >
                <Moon size={24} color={theme === "dark" ? colors.primary : colors.mutedForeground} />
                <Text
                  style={[
                    styles.themeLabel,
                    theme === "dark" && styles.themeLabelActive,
                  ]}
                >
                  Escuro
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.themeOption,
                  theme === "system" && styles.themeOptionActive,
                ]}
                onPress={() => setTheme("system")}
              >
                <Monitor size={24} color={theme === "system" ? colors.primary : colors.mutedForeground} />
                <Text
                  style={[
                    styles.themeLabel,
                    theme === "system" && styles.themeLabelActive,
                  ]}
                >
                  Sistema
                </Text>
              </TouchableOpacity>
            </View>
          </CardContent>
        </Card>

        {/* Household Info */}
        <Card style={styles.card}>
          <CardHeader>
            <CardTitle>Informações da Household</CardTitle>
            <CardDescription>Detalhes sobre sua household atual</CardDescription>
          </CardHeader>
          <CardContent>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Nome</Text>
              <Text style={styles.infoValue}>{currentHousehold?.name}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Permissão</Text>
              <Badge variant={isOwner ? "default" : "muted"}>
                {isOwner ? "Dono" : "Membro"}
              </Badge>
            </View>
          </CardContent>
        </Card>

        {/* Meal Types */}
        <Card style={styles.card}>
          <CardHeader>
            <View style={styles.cardHeaderRow}>
              <View style={styles.cardHeaderText}>
                <CardTitle>Tipos de Refeições</CardTitle>
                <CardDescription>
                  Defina os tipos de refeição para o planejamento
                </CardDescription>
              </View>
              {isOwner && (
                <Button title="+ Novo" onPress={openCreateDialog} />
              )}
            </View>
          </CardHeader>
          <CardContent>
            {loading && <LoadingState message="Carregando..." />}

            {!loading && mealTypes.length === 0 && (
              <Text style={styles.emptyText}>
                Nenhum tipo de refeição cadastrado.
              </Text>
            )}

            {!loading && mealTypes.length > 0 && (
              <View style={styles.mealTypeList}>
                {mealTypes.map((mealType, index) => (
                  <View key={mealType.id} style={styles.mealTypeItem}>
                    <View style={styles.mealTypeInfo}>
                      <Text style={styles.mealTypeName}>{mealType.name}</Text>
                      <Text style={styles.mealTypeOrder}>
                        Ordem: {mealType.order}
                      </Text>
                    </View>
                    {isOwner && (
                      <View style={styles.mealTypeActions}>
                        <TouchableOpacity
                          style={styles.reorderBtn}
                          onPress={() => handleReorder(mealType, "up")}
                          disabled={index === 0}
                        >
                          <ChevronUp
                            size={18}
                            color={index === 0 ? colors.muted : colors.foreground}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.reorderBtn}
                          onPress={() => handleReorder(mealType, "down")}
                          disabled={index === mealTypes.length - 1}
                        >
                          <ChevronDown
                            size={18}
                            color={index === mealTypes.length - 1 ? colors.muted : colors.foreground}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => openEditDialog(mealType)}
                        >
                          <Pencil size={16} color={colors.mutedForeground} />
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.actionBtn}
                          onPress={() => handleDelete(mealType)}
                        >
                          <Trash2 size={16} color={colors.destructive} />
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </CardContent>
        </Card>

        {/* Logout Button */}
        <Button
          title="Sair da conta"
          variant="outline"
          onPress={logout}
          fullWidth
          style={styles.logoutBtn}
        />
      </ScrollView>

      <Dialog
        visible={formDialog.isOpen}
        onClose={formDialog.close}
        title={
          formDialog.editingItem
            ? "Editar Tipo de Refeição"
            : "Novo Tipo de Refeição"
        }
        description="Preencha o nome do tipo de refeição"
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
          placeholder="Ex: Café da manhã, Almoço, Jantar"
          value={formData.name}
          onChangeText={(text) =>
            setFormData((prev) => ({ ...prev, name: text }))
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
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardHeaderText: {
    flex: 1,
    marginRight: 12,
  },
  themeGrid: {
    flexDirection: "row",
    gap: 12,
  },
  themeOption: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.background,
  },
  themeOptionActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primary + "10",
  },
  themeIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  themeLabel: {
    color: colors.foreground,
    fontSize: 13,
    fontWeight: "500",
  },
  themeLabelActive: {
    color: colors.primary,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  infoLabel: {
    color: colors.mutedForeground,
    fontSize: 14,
  },
  infoValue: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  mealTypeList: {
    gap: 10,
  },
  mealTypeItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: colors.background,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mealTypeInfo: {
    flex: 1,
  },
  mealTypeName: {
    color: colors.foreground,
    fontSize: 14,
    fontWeight: "600",
  },
  mealTypeOrder: {
    color: colors.mutedForeground,
    fontSize: 12,
    marginTop: 2,
  },
  mealTypeActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  reorderBtn: {
    padding: 6,
  },
  reorderText: {
    color: colors.foreground,
    fontSize: 12,
  },
  disabledText: {
    opacity: 0.3,
  },
  actionBtn: {
    padding: 6,
  },
  actionIcon: {
    fontSize: 14,
  },
  emptyText: {
    color: colors.mutedForeground,
    fontSize: 14,
    textAlign: "center",
    paddingVertical: 16,
  },
  logoutBtn: {
    marginTop: 8,
    borderColor: colors.destructive,
  },
  dialogFooter: {
    flexDirection: "row",
    gap: 12,
  },
  dialogBtn: {
    flex: 1,
  },
});
