import { useState } from "react";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import type { Ingredient, IngredientFormState } from "@/types/ingredients";

interface IngredientFormDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSave: (formData: IngredientFormState) => Promise<void>;
	initialData?: Ingredient;
	error?: string | null;
}

export function IngredientFormDialog({
	isOpen,
	onOpenChange,
	onSave,
	initialData,
	error,
}: IngredientFormDialogProps) {
	const [form, setForm] = useState<IngredientFormState>({
		id: initialData?.id,
		name: initialData?.name || "",
		default_unit: initialData?.default_unit || "",
	});

	const [saving, setSaving] = useState(false);
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

		setSaving(true);
		setFormError(null);

		try {
			await onSave(form);
			onOpenChange(false);
			setForm({
				id: undefined,
				name: "",
				default_unit: "",
			});
		} catch (err: any) {
			setFormError(err.message || "Erro ao salvar ingrediente.");
		} finally {
			setSaving(false);
		}
	};

	const handleOpenChange = (open: boolean) => {
		if (!open) {
			setForm({
				id: undefined,
				name: "",
				default_unit: "",
			});
			setFormError(null);
		}
		onOpenChange(open);
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogContent className="max-w-md">
				<DialogHeader>
					<DialogTitle>
						{initialData ? "Editar Ingrediente" : "Novo Ingrediente"}
					</DialogTitle>
					<DialogDescription>
						{initialData
							? "Atualize as informações do ingrediente"
							: "Adicione um novo ingrediente"}
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div>
						<Label htmlFor="name">Nome do Ingrediente</Label>
						<Input
							id="name"
							placeholder="ex: Tomate"
							value={form.name}
							onChange={(e) => handleChangeField("name", e.target.value)}
							disabled={saving}
						/>
					</div>

					<div>
						<Label htmlFor="default_unit">Unidade Padrão</Label>
						<Input
							id="default_unit"
							placeholder="ex: kg, ml, unidade"
							value={form.default_unit}
							onChange={(e) => handleChangeField("default_unit", e.target.value)}
							disabled={saving}
						/>
					</div>

					{(formError || error) && (
						<div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
							{formError || error}
						</div>
					)}
				</div>

				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => handleOpenChange(false)}
						disabled={saving}
					>
						Cancelar
					</Button>
					<Button onClick={handleSave} disabled={saving}>
						{saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
						{saving ? "Salvando..." : initialData ? "Atualizar" : "Criar"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
