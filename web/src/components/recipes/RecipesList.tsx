import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import type { Recipe } from "@/types/recipes";
import { RecipeCardItem } from "./RecipeCardItem";

type Props = {
	recipes: Recipe[];
	loading: boolean;
	error: string | null;
	onEdit: (recipe: Recipe) => void;
	onDelete: (recipe: Recipe) => void;
	isOwner?: boolean;
};

export function RecipesList({
	recipes,
	loading,
	error,
	onEdit,
	onDelete,
	isOwner = true,
}: Props) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Receitas</CardTitle>

				<CardDescription>
					Gerencie as receitas da sua casa e vincule ingredientes.
				</CardDescription>
			</CardHeader>

			<CardContent>
				{error && (
					<div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
						{error}
					</div>
				)}

				{loading ? (
					<div className="flex items-center gap-2 text-sm text-muted-foreground">
						<Loader2 className="h-4 w-4 animate-spin" />
						Carregando receitas...
					</div>
				) : recipes.length === 0 ? (
					<p className="text-sm text-muted-foreground">
						Nenhuma receita encontrada. Crie a primeira receita.
					</p>
				) : (
					<div className="space-y-2">
						{recipes.map((recipe) => (
							<RecipeCardItem
								key={recipe.id}
								recipe={recipe}
								onEdit={onEdit}
								onDelete={onDelete}
								isOwner={isOwner}
							/>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
