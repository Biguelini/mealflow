import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import type { Recipe } from "@/types/recipes";

type Props = {
	recipe: Recipe;
	onEdit: (recipe: Recipe) => void;
	onDelete: (recipe: Recipe) => void;
};

export function RecipeCardItem({ recipe, onEdit, onDelete }: Props) {
	return (
		<div className="flex items-start justify-between gap-2 rounded-md border border-border px-3 py-2">
			<div className="space-y-1">
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-sm font-medium">{recipe.name}</span>
					{(recipe.tags ?? []).length > 0 && (
						<div className="flex flex-wrap gap-1">
							{recipe.tags!.map((tag) => (
								<span
									key={tag}
									className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground"
								>
									{tag}
								</span>
							))}
						</div>
					)}
				</div>

				{recipe.description && (
					<p className="text-xs text-muted-foreground">{recipe.description}</p>
				)}

				{recipe.ingredients && recipe.ingredients.length > 0 && (
					<p className="text-[11px] text-muted-foreground">
						Ingredientes:{" "}
						{recipe.ingredients
							.map((ing) => {
								const qty = ing.pivot.quantity;
								const unit = ing.pivot.unit;
								return `${qty ?? "?"}${unit ? ` ${unit}` : ""} ${ing.name}`;
							})
							.join(", ")}
					</p>
				)}
			</div>

			<div className="flex items-center gap-1">
				<Button variant="ghost" size="icon" onClick={() => onEdit(recipe)}>
					<Pencil className="h-4 w-4" />
				</Button>
				<Button variant="ghost" size="icon" onClick={() => onDelete(recipe)}>
					<Trash2 className="h-4 w-4 text-destructive" />
				</Button>
			</div>
		</div>
	);
}
