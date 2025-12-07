import { useEffect, useRef } from "react";
import { useFormDialog } from "@/hooks/useFormDialog";
import { useApi } from "@/hooks/useApi";
import { useHouseholdContext } from "@/context/HouseholdContext";
import {
	PageHeader,
	PageContainer,
	ErrorMessage,
	LoadingState,
	EmptyState,
	GenericFormDialog,
} from "@/components/common";
import { IngredientList } from "@/components/ingredients/IngredientsList";
import { IngredientFormContent, type IngredientFormContentRef } from "@/components/ingredients/IngredientFormContent";
import type { Ingredient, IngredientFormState } from "@/types/ingredients";

export function IngredientsPage() {
	const { isOwner } = useHouseholdContext();
	const { data: ingredients, loading, error, fetch, setData } = useApi<
		Ingredient[]
	>([]);
	const { isOpen, isSaving, error: formError, editingItem, open, close, setSaving, setError } = useFormDialog<Ingredient>();
	const formRef = useRef<IngredientFormContentRef>(null);

	async function loadIngredients() {
		await fetch("/ingredients", { method: "GET" });
	}

	useEffect(() => {
		loadIngredients();
	}, []);

	async function handleSave(formData: IngredientFormState) {
		setError(null);

		try {
			setSaving(true);

			if (formData.id) {
				await fetch(`/ingredients/${formData.id}`, {
					method: "PUT",
					data: {
						name: formData.name,
						default_unit: formData.default_unit || null,
					},
				});

				setData(
					(ingredients || []).map((ing) =>
						ing.id === formData.id
							? {
								...ing,
								name: formData.name,
								default_unit: formData.default_unit || null,
							}
							: ing
					)
				);
			} else {

				const newIngredient = await fetch("/ingredients", {
					method: "POST",
					data: {
						name: formData.name,
						default_unit: formData.default_unit || null,
					},
				});

				setData([newIngredient as unknown as Ingredient, ...(ingredients || [])]);
			}

			close();
		} catch (err: any) {
			setError(err.message || "Erro ao salvar ingrediente.");
			throw err;
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(ingredient: Ingredient) {
		if (
			!confirm(`Deseja remover o ingrediente "${ingredient.name}"?`)
		) {
			return;
		}

		try {
			setSaving(true);
			await fetch(`/ingredients/${ingredient.id}`, { method: "DELETE" });
			setData((ingredients || []).filter((ing) => ing.id !== ingredient.id));
		} catch (err: any) {
			setError(err.message || "Erro ao deletar ingrediente.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<PageContainer>
			<PageHeader
				title="Ingredientes"
				description="Gerencie os ingredientes disponíveis"
				action={
					isOwner && (
						<button
							onClick={() => open()}
							className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/80 border border-transparent hover:border-gray-200 transition-colors duration-150"
						>
							+ Novo Ingrediente
						</button>
					)
				}
			/>

			{error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

			{loading && <LoadingState message="Carregando ingredientes..." />}

			{!loading && ingredients && ingredients.length === 0 && (
				<EmptyState
					title="Nenhum ingrediente cadastrado"
					description="Crie seu primeiro ingrediente para começar"
				/>
			)}

			{!loading && ingredients && ingredients.length > 0 && (
				<IngredientList
					ingredients={ingredients}
					loading={loading}
					onEdit={open}
					onDelete={handleDelete}
					isOwner={isOwner}
				/>
			)}

			<GenericFormDialog
				isOpen={isOpen}
				onOpenChange={(isOpen) => (isOpen ? open() : close())}
				title={editingItem ? "Editar Ingrediente" : "Novo Ingrediente"}
				description={
					editingItem
						? "Atualize as informações do ingrediente"
						: "Adicione um novo ingrediente"
				}
				onSave={async () => {
					await formRef.current?.submit();
				}}
				isSaving={isSaving}
				error={formError}
				saveLabel={editingItem ? "Atualizar" : "Criar"}
			>
				<IngredientFormContent
					ref={formRef}
					initialData={editingItem}
					onSave={handleSave}
					isSaving={isSaving}
				/>
			</GenericFormDialog>
		</PageContainer>
	);
}
