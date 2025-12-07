import { useState, useImperativeHandle, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Ingredient, IngredientFormState } from "@/types/ingredients";

interface IngredientFormContentProps {
	initialData?: Ingredient;
	onSave: (formData: IngredientFormState) => Promise<void>;
	isSaving?: boolean;
}

export interface IngredientFormContentRef {
	submit: () => Promise<void>;
}

export const IngredientFormContent = forwardRef<IngredientFormContentRef, IngredientFormContentProps>(({
	initialData,
	onSave,
	isSaving,
}, ref) => {
	const [form, setForm] = useState<IngredientFormState>({
		id: initialData?.id,
		name: initialData?.name || "",
		default_unit: initialData?.default_unit || "",
	});
	const [formError, setFormError] = useState<string | null>(null);

	const handleChangeField = <K extends keyof IngredientFormState>(
		field: K,
		value: IngredientFormState[K]
	) => {
		setForm((prev) => ({
			...prev,
			[field]: value,
		}));
	};

	const handleSave = async () => {
		if (!form.name.trim()) {
			setFormError("Nome do ingrediente é obrigatório.");
			return;
		}

		setFormError(null);

		try {
			await onSave(form);
		} catch (err: any) {
			setFormError(err.message || "Erro ao salvar ingrediente.");
		}
	};

	useImperativeHandle(ref, () => ({
		submit: handleSave,
	}));

	return (
		<div className="space-y-4">
			<div className="space-y-2">
				<Label htmlFor="name">Nome do Ingrediente</Label>

				<Input
					id="name"
					placeholder="ex: Tomate"
					value={form.name}
					onChange={(e) => handleChangeField("name", e.target.value)}
					disabled={isSaving}
				/>
			</div>

			<div className="space-y-2">
				<Label htmlFor="default_unit">Unidade Padrão</Label>

				<Input
					id="default_unit"
					placeholder="ex: kg, ml, unidade"
					value={form.default_unit}
					onChange={(e) => handleChangeField("default_unit", e.target.value)}
					disabled={isSaving}
				/>
			</div>

			{formError && (
				<div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
					{formError}
				</div>
			)}
		</div>
	);
});
