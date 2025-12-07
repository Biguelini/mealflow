import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Plus } from "lucide-react";

type Props = {
	search: string;
	onSearchChange: (value: string) => void;
	tags: string[];
	selectedTag: string;
	onTagChange: (value: string) => void;
	onCreateClick: () => void;
};

export function RecipeFilters({
	search,
	onSearchChange,
	tags,
	selectedTag,
	onTagChange,
	onCreateClick,
}: Props) {
	return (
		<div className="flex items-center justify-between gap-2">
			<div className="flex flex-1 flex-wrap items-center gap-2">
				<Input
					placeholder="Buscar receitas por nome..."
					className="w-full max-w-xs"
					value={search}
					onChange={(e) => onSearchChange(e.target.value)}
				/>

				{tags.length > 0 && (
					<div className="flex items-center gap-2">
						<span className="text-xs text-muted-foreground">Tag:</span>
						<Select value={selectedTag} onValueChange={onTagChange}>
							<SelectTrigger className="h-8 w-[150px] text-xs">
								<SelectValue placeholder="Todas" />
							</SelectTrigger>

							<SelectContent>
								<SelectItem value="">Todas</SelectItem>

								{tags.map((tag) => (
									<SelectItem key={tag} value={tag}>
										{tag}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				)}
			</div>

			<Button onClick={onCreateClick}>
				<Plus className="mr-2 h-4 w-4" />
				Nova receita
			</Button>
		</div>
	);
}
