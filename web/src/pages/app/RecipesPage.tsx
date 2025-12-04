import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/services/api";
import { RecipeFilters } from "@/components/recipes/RecipeFilters";
import { RecipesList } from "@/components/recipes/RecipesList";
import { RecipeFormDialog } from "@/components/recipes/RecipeFormDialog";
import type {
	Ingredient,
	Recipe,
	RecipeFormState,
	RecipeIngredient,
} from "@/types/recipes";

const HOUSEHOLD_ID = 1;

export function RecipesPage() {
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [ingredients, setIngredients] = useState<Ingredient[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingIngredients, setLoadingIngredients] = useState(false);

	const [search, setSearch] = useState("");
	const [selectedTag, setSelectedTag] = useState("");

	const [listError, setListError] = useState<string | null>(null);
	const [formError, setFormError] = useState<string | null>(null);

	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [saving, setSaving] = useState(false);

	const [form, setForm] = useState<RecipeFormState>({
		name: "",
		description: "",
		tagsText: "",
		ingredients: [
			{
				ingredientId: "",
				quantity: "",
				unit: "",
			},
		],
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
					household_id: HOUSEHOLD_ID,
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
	}, [search]);

	function openCreateDialog() {
		setForm({
			id: undefined,
			name: "",
			description: "",
			tagsText: "",
			ingredients: [
				{
					ingredientId: "",
					quantity: "",
					unit: "",
				},
			],
		});
		setFormError(null);
		setIsDialogOpen(true);
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
				})) ?? [
					{
						ingredientId: "",
						quantity: "",
						unit: "",
					},
				],
		});
		setFormError(null);
		setIsDialogOpen(true);
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
			setFormError("Nome da receita é obrigatório.");
			return;
		}

		setSaving(true);
		setFormError(null);

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
				household_id: HOUSEHOLD_ID,
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

			setIsDialogOpen(false);
			await loadRecipes();
		} catch (err: any) {
			console.error(err);
			setFormError(err.message ?? "Erro ao salvar receita.");
		} finally {
			setSaving(false);
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
		if (!selectedTag) return recipes;
		return recipes.filter((r) => (r.tags ?? []).includes(selectedTag));
	}, [recipes, selectedTag]);

	return (
		<div className="space-y-4">
			<RecipeFilters
				search={search}
				onSearchChange={setSearch}
				tags={allTags}
				selectedTag={selectedTag}
				onTagChange={setSelectedTag}
				onCreateClick={openCreateDialog}
			/>

			<RecipesList
				recipes={filteredRecipes}
				loading={loading}
				error={listError}
				onEdit={openEditDialog}
				onDelete={handleDelete}
			/>

			<RecipeFormDialog
				open={isDialogOpen}
				onOpenChange={setIsDialogOpen}
				form={form}
				onChangeField={handleChangeField}
				onChangeIngredient={handleChangeIngredient}
				onAddIngredient={addIngredientRow}
				onRemoveIngredient={removeIngredientRow}
				onSave={handleSave}
				saving={saving}
				error={formError}
				ingredients={ingredients}
				loadingIngredients={loadingIngredients}
			/>
		</div>
	);
}
