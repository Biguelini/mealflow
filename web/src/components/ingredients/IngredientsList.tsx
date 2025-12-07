import { Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardContent,
} from "@/components/ui/card";
import type { Ingredient } from "@/types/ingredients";

interface IngredientListProps {
	ingredients: Ingredient[];
	loading: boolean;
	onEdit: (ingredient: Ingredient) => void;
	onDelete: (ingredient: Ingredient) => void;
	error?: string | null;
	isOwner?: boolean;
}

export function IngredientList({
	ingredients,
	loading,
	onEdit,
	onDelete,
	error,
	isOwner = true,
}: IngredientListProps) {
	if (error) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
						{error}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (loading) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="flex items-center justify-center py-8">
						<Loader2 className="mr-2 h-5 w-5 animate-spin" />

						<span>Carregando ingredientes...</span>
					</div>
				</CardContent>
			</Card>
		);
	}

	if (ingredients.length === 0) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center text-gray-500">
						<p>Nenhum ingrediente cadastrado.</p>

						<p className="text-sm">Crie um novo para começar.</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
			{ingredients.map((ingredient) => (
				<Card key={ingredient.id} className="flex flex-col">
					<CardHeader className="flex-1">
						<CardTitle className="text-lg">{ingredient.name}</CardTitle>

						{ingredient.default_unit && (
							<div className="text-sm text-gray-500">
								Unidade padrão: <span className="font-medium">{ingredient.default_unit}</span>
							</div>
						)}
					</CardHeader>
					{isOwner && (
						<CardContent className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								onClick={() => onEdit(ingredient)}
								className="flex-1 hover:bg-accent"
							>
								<Pencil className="mr-2 h-4 w-4" />
								Editar
							</Button>

							<Button
								variant="outline"
								size="sm"
								onClick={() => onDelete(ingredient)}
								className="flex-1 hover:text-destructive hover:bg-destructive/10 transition-colors"
							>
								<Trash2 className="mr-2 h-4 w-4" />
								Deletar
							</Button>
						</CardContent>
					)}
				</Card>
			))}
		</div>
	);
}
