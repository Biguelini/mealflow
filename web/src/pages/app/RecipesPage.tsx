import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/services/api";
import { useHouseholdContext } from "@/context/HouseholdContext";
import {
	PageHeader,
	PageContainer,
	ErrorMessage,
	LoadingState,
	EmptyState,
} from "@/components/common";
import { RecipesList } from "@/components/recipes/RecipesList";
import { RecipeFormDialog } from "@/components/recipes/RecipeFormDialog";
import { useFormDialog } from "@/hooks/useFormDialog";
import { Button } from "@/components/ui/button";
import type {
	Ingredient,
	Recipe,
	RecipeFormState,
	RecipeIngredient,
} from "@/types/recipes";

export function RecipesPage() {
	const { currentHousehold, isOwner } = useHouseholdContext();
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [ingredients, setIngredients] = useState<Ingredient[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingIngredients, setLoadingIngredients] = useState(false);
	const [search, setSearch] = useState("");
	const [listError, setListError] = useState<string | null>(null);

	const formDialog = useFormDialog<Recipe>();
	const [form, setForm] = useState<RecipeFormState>({
		name: "",
		description: "",
		tagsText: "",
		ingredients: [{ ingredientId: "", quantity: "", unit: "" }],
	});

	const allTags = useMemo(() => {
		const tags = new Set<string>();
		recipes.forEach((r) => {
			(r.tags ?? []).forEach((t) => tags.add(t));
		});
		return Array.from(tags).sort();
	}, [recipes]);


	async function loadIngredients() {
		try {
			setLoadingIngredients(true);
			const data = await apiFetch<Ingredient[]>("/ingredients", {
				method: "GET",
			});
			setIngredients(data);
		} catch (err) {
			console.error("Failed to load ingredients", err);
		} finally {
			setLoadingIngredients(false);
		}
	}

	async function loadRecipes() {
		try {
			setLoading(true);
			setListError(null);

			const data = await apiFetch<{ data: Recipe[] }>("/recipes/search", {
				method: "POST",
				data: {
					household_id: currentHousehold?.id,
					q: search || null,
				},
			});

			setRecipes(data.data);
		} catch (err: any) {
			console.error(err);
			setListError(err.message ?? "Erro ao carregar receitas.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadIngredients();
	}, []);

	useEffect(() => {
		loadRecipes();
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

	function handleChangeField<K extends keyof RecipeFormState>(
		field: K,
		value: RecipeFormState[K]
	) {
		setForm((prev) => ({
			...prev,
			[field]: value,
		}));
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

			const ingredientsPayload: RecipeIngredient[] = form.ingredients
				.filter((row) => row.ingredientId)
				.map((row) => ({
					ingredient_id: Number(row.ingredientId),
					quantity: row.quantity ? Number(row.quantity) : null,
					unit: row.unit || null,
				}));

			const payload: any = {
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
				await apiFetch<Recipe>(`/recipes/${form.id}`, {
					method: "PUT",
					data: payload,
				});
			} else {
				await apiFetch<Recipe>("/recipes", {
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
		if (!window.confirm(`Excluir a receita "${recipe.name}"?`)) return;

		try {
			await apiFetch(`/recipes/${recipe.id}`, {
				method: "DELETE",
			});
			await loadRecipes();
		} catch (err: any) {
			console.error(err);
			alert(err.message ?? "Erro ao excluir receita.");
		}
	}

	const filteredRecipes = useMemo(() => {
		return recipes;
	}, [recipes]);

	return (
		<PageContainer>
			<PageHeader
				title="Receitas"
				description="Gerencie as receitas da sua casa com ingredientes e tags."
				action={
					isOwner && (
						<button
							onClick={openCreateDialog}
							className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/80  border border-transparent hover:border-gray-200 transition-colors duration-150"
						>
							+ Nova Receita
						</button>
					)
				}
			/>

			{listError && (
				<ErrorMessage
					message={listError}
					onDismiss={() => setListError(null)}
				/>
			)}

			{loading ? (
				<LoadingState message="Carregando receitas..." />
			) : filteredRecipes.length === 0 ? (
				<EmptyState
					title="Nenhuma receita encontrada"
					description={
						search
							? "Tente ajustar sua busca."
							: "Crie a primeira receita para começar."
					}
					action={
						!search && isOwner && (
							<Button onClick={openCreateDialog}>+ Nova Receita</Button>
						)
					}
				/>
			) : (
				<RecipesList
					recipes={filteredRecipes}
					loading={false}
					error={null}
					onEdit={openEditDialog}
					onDelete={handleDelete}
					isOwner={isOwner}
				/>
			)}

			<RecipeFormDialog
				open={formDialog.isOpen}
				onOpenChange={(open) => {
					if (!open) formDialog.close();
					else formDialog.open();
				}}
				form={form}
				onChangeField={handleChangeField}
				onChangeIngredient={handleChangeIngredient}
				onAddIngredient={addIngredientRow}
				onRemoveIngredient={removeIngredientRow}
				onSave={handleSave}
				saving={formDialog.isSaving}
				error={formDialog.error}
				ingredients={ingredients}
				loadingIngredients={loadingIngredients}
			/>
		</PageContainer>
	);
}
