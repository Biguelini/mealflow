import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Plus, X } from "lucide-react";
import type {
	Ingredient,
	RecipeFormIngredientRow,
	RecipeFormState,
} from "@/types/recipes";

type IngredientRowProps = {
	index: number;
	row: RecipeFormIngredientRow;
	ingredients: Ingredient[];
	onChange: (
		index: number,
		field: "ingredientId" | "quantity" | "unit",
		value: string
	) => void;
	onRemove: (index: number) => void;
};

function IngredientRow({
	index,
	row,
	ingredients,
	onChange,
	onRemove,
}: IngredientRowProps) {
	const selectedIngredient = ingredients.find(
		(ing) => String(ing.id) === row.ingredientId
	);
	const displayUnit = selectedIngredient?.default_unit || "-";

	return (
		<div className="grid gap-2 px-3 py-2 sm:grid-cols-[minmax(0,2.2fr)_80px_80px_40px] sm:items-center">
			<div>
				<span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
					Ingrediente
				</span>

				<Select
					value={row.ingredientId}
					onValueChange={(value) => onChange(index, "ingredientId", value)}
				>
					<SelectTrigger className="h-9 w-full overflow-hidden text-ellipsis whitespace-nowrap text-sm">
						<SelectValue placeholder="Selecione..." />
					</SelectTrigger>

					<SelectContent>
						{ingredients.map((ing) => (
							<SelectItem key={ing.id} value={String(ing.id)}>
								{ing.name}
								{ing.default_unit && (
									<span className="text-muted-foreground ml-1">
										({ing.default_unit})
									</span>
								)}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			<div>
				<span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
					Quantidade
				</span>

				<Input
					value={row.quantity}
					onChange={(e) => onChange(index, "quantity", e.target.value)}
					inputMode="decimal"
					placeholder="ex: 250"
					className="h-9 w-full text-sm"
				/>
			</div>

			<div>
				<span className="mb-1 block text-[11px] font-medium text-muted-foreground sm:hidden">
					Unidade
				</span>

				<div className="flex h-9 items-center justify-center rounded-md border border-input bg-muted/50 px-2 text-sm text-muted-foreground">
					{displayUnit}
				</div>
			</div>

			<div className="flex items-center justify-end sm:justify-center">
				<button
					type="button"
					onClick={() => onRemove(index)}
					className="flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground hover:bg-gray-50 dark:hover:bg-gray-900/50"
				>
					<X className="h-4 w-4" />
				</button>
			</div>
		</div>
	);
}

type Props = {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	form: RecipeFormState;
	onChangeField: <K extends keyof RecipeFormState>(
		field: K,
		value: RecipeFormState[K]
	) => void;
	onChangeIngredient: (
		index: number,
		field: "ingredientId" | "quantity" | "unit",
		value: string
	) => void;
	onAddIngredient: () => void;
	onRemoveIngredient: (index: number) => void;
	onSave: () => void;
	saving: boolean;
	error: string | null;
	ingredients: Ingredient[];
	loadingIngredients: boolean;
};

export function RecipeFormDialog({
	open,
	onOpenChange,
	form,
	onChangeField,
	onChangeIngredient,
	onAddIngredient,
	onRemoveIngredient,
	onSave,
	saving,
	error,
	ingredients,
	loadingIngredients,
}: Props) {
	const isEditing = Boolean(form.id);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="flex max-h-[90vh] w-[95vw] max-w-2xl flex-col">
				<DialogHeader>
					<DialogTitle>
						{isEditing ? "Editar receita" : "Nova receita"}
					</DialogTitle>

					<DialogDescription>
						Preencha os detalhes da receita e os ingredientes.
					</DialogDescription>
				</DialogHeader>

				<div className="flex-1 overflow-y-auto px-2">
					<div className="space-y-5">
						<div className="space-y-4">
							{error && (
								<div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
									{error}
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="name">Nome</Label>

								<Input
									id="name"
									value={form.name}
									onChange={(e) => onChangeField("name", e.target.value)}
									placeholder="Ex: Macarrão alho e óleo"
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="description">Descrição</Label>

								<Textarea
									id="description"
									value={form.description}
									onChange={(e) =>
										onChangeField("description", e.target.value)
									}
									placeholder="Descrição rápida da receita..."
									rows={3}
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="tags">
									Tags{" "}
									<span className="text-[10px] text-muted-foreground">
										(separadas por vírgula)
									</span>
								</Label>

								<Input
									id="tags"
									value={form.tagsText}
									onChange={(e) =>
										onChangeField("tagsText", e.target.value)
									}
									placeholder="ex: massa, rápido, vegetariano"
								/>
							</div>

							<div className="space-y-2">
								<div className="flex items-center justify-between gap-2">
									<Label>Ingredientes</Label>

									<Button
										type="button"
										variant="outline"
										size="sm"
										onClick={onAddIngredient}
									>
										<Plus className="mr-1 h-3 w-3" />
										Adicionar
									</Button>
								</div>

								{loadingIngredients && (
									<p className="text-[11px] text-muted-foreground">
										Carregando ingredientes...
									</p>
								)}

								<div className="rounded-lg border border-border bg-muted/10">
									<div className="hidden sm:grid grid-cols-[minmax(0,2.2fr)_80px_80px_40px] items-center gap-2 border-b px-3 py-2 text-[11px] font-medium text-muted-foreground">
										<span>Ingrediente</span>
										<span>Quantidade</span>
										<span>Unidade</span>
										<span className="sr-only">Remover</span>
									</div>

									<div className="divide-y">
										{form.ingredients.map((row, index) => (
											<IngredientRow
												key={index}
												index={index}
												row={row}
												ingredients={ingredients}
												onChange={onChangeIngredient}
												onRemove={onRemoveIngredient}
											/>
										))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
					<Button
						type="button"
						variant="outline"
						onClick={() => onOpenChange(false)}
						className="w-full sm:w-auto"
					>
						Cancelar
					</Button>
					<Button type="button" onClick={onSave} disabled={saving} className="w-full sm:w-auto">
						{saving ? "Salvando..." : "Salvar receita"}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
}
