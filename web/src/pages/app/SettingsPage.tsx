import { useEffect, useState } from "react";
import { apiFetch } from "@/services/api";
import { useHouseholdContext } from "@/context/HouseholdContext";
import { useTheme } from "@/context/ThemeContext";
import {
	PageContainer,
	PageHeader,
	ErrorMessage,
	LoadingState,
} from "@/components/common";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, ChevronUp, ChevronDown, Sun, Moon, Monitor } from "lucide-react";
import type { MealType, MealTypeFormState } from "@/types/mealTypes";

export function SettingsPage() {
	const { currentHousehold, isOwner } = useHouseholdContext();
	const { theme, setTheme } = useTheme();
	const [mealTypes, setMealTypes] = useState<MealType[]>([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [dialogOpen, setDialogOpen] = useState(false);
	const [editingMealType, setEditingMealType] = useState<MealType | null>(null);
	const [saving, setSaving] = useState(false);
	const [formData, setFormData] = useState<MealTypeFormState>({
		name: "",
	});

	async function loadMealTypes() {
		try {
			setLoading(true);
			setError(null);
			const data = await apiFetch<MealType[]>("/meal-types", {
				method: "GET",
				params: { household_id: currentHousehold?.id },
			});
			setMealTypes(data);
		} catch (err: any) {
			setError(err.message || "Erro ao carregar tipos de refeição");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		if (currentHousehold?.id) {
			loadMealTypes();
		}
	}, [currentHousehold?.id]);

	function openCreateDialog() {
		setEditingMealType(null);
		setFormData({ name: "" });
		setDialogOpen(true);
	}

	function openEditDialog(mealType: MealType) {
		setEditingMealType(mealType);
		setFormData({
			id: mealType.id,
			name: mealType.name,
			order: mealType.order,
		});
		setDialogOpen(true);
	}

	async function handleSave() {
		if (!formData.name.trim()) {
			setError("O nome da refeição é obrigatório");
			return;
		}

		try {
			setSaving(true);
			setError(null);

			if (editingMealType) {

				const updated = await apiFetch<MealType>(
					`/meal-types/${editingMealType.id}`,
					{
						method: "PUT",
						data: {
							name: formData.name,
							order: formData.order,
						},
					}
				);

				setMealTypes((prev) =>
					prev.map((mt) => (mt.id === updated.id ? updated : mt))
				);
			} else {

				const created = await apiFetch<MealType>("/meal-types", {
					method: "POST",
					data: {
						household_id: currentHousehold?.id,
						name: formData.name,
						order: formData.order,
					},
				});

				setMealTypes((prev) => [...prev, created].sort((a, b) => a.order - b.order));
			}

			setDialogOpen(false);
			setFormData({ name: "" });
		} catch (err: any) {
			setError(err.message || "Erro ao salvar tipo de refeição");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(mealType: MealType) {
		if (
			!confirm(
				`Tem certeza que deseja excluir "${mealType.name}"? Isso afetará todos os planos de refeições que usam este tipo.`
			)
		) {
			return;
		}

		try {
			setError(null);
			await apiFetch(`/meal-types/${mealType.id}`, {
				method: "DELETE",
			});

			setMealTypes((prev) => prev.filter((mt) => mt.id !== mealType.id));
		} catch (err: any) {
			setError(err.message || "Erro ao excluir tipo de refeição");
		}
	}

	async function handleReorder(mealType: MealType, direction: "up" | "down") {
		const currentIndex = mealTypes.findIndex((mt) => mt.id === mealType.id);
		if (
			(direction === "up" && currentIndex === 0) ||
			(direction === "down" && currentIndex === mealTypes.length - 1)
		) {
			return;
		}

		const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
		const swapMealType = mealTypes[newIndex];

		try {

			await Promise.all([
				apiFetch(`/meal-types/${mealType.id}`, {
					method: "PUT",
					data: { order: swapMealType.order },
				}),
				apiFetch(`/meal-types/${swapMealType.id}`, {
					method: "PUT",
					data: { order: mealType.order },
				}),
			]);


			const newMealTypes = [...mealTypes];
			[newMealTypes[currentIndex], newMealTypes[newIndex]] = [
				newMealTypes[newIndex],
				newMealTypes[currentIndex],
			];
			setMealTypes(newMealTypes);
		} catch (err: any) {
			setError(err.message || "Erro ao reordenar tipos de refeição");
		}
	}

	return (
		<PageContainer>
			<PageHeader
				title="Configurações"
				description="Gerencie as configurações da sua household"
			/>

			{error && (
				<ErrorMessage message={error} onDismiss={() => setError(null)} />
			)}

			<Card className="mb-6">
				<CardHeader className="border-b">
					<CardTitle>Aparência</CardTitle>
					<CardDescription>
						Personalize a aparência do aplicativo
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="space-y-3">
						<Label className="text-sm font-medium text-muted-foreground">Tema</Label>
						<div className="grid grid-cols-3 gap-2 sm:gap-3">
							<button
								onClick={() => setTheme("light")}
								className={`flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border-2 p-3 sm:p-4 transition-all ${
									theme === "light"
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary/50 hover:bg-muted/50"
								}`}
							>
								<Sun className={`h-5 w-5 sm:h-6 sm:w-6 ${theme === "light" ? "text-primary" : "text-muted-foreground"}`} />
								<span className={`text-xs sm:text-sm font-medium ${theme === "light" ? "text-primary" : "text-foreground"}`}>
									Claro
								</span>
							</button>
							<button
								onClick={() => setTheme("dark")}
								className={`flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border-2 p-3 sm:p-4 transition-all ${
									theme === "dark"
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary/50 hover:bg-muted/50"
								}`}
							>
								<Moon className={`h-5 w-5 sm:h-6 sm:w-6 ${theme === "dark" ? "text-primary" : "text-muted-foreground"}`} />
								<span className={`text-xs sm:text-sm font-medium ${theme === "dark" ? "text-primary" : "text-foreground"}`}>
									Escuro
								</span>
							</button>
							<button
								onClick={() => setTheme("system")}
								className={`flex flex-col items-center gap-1.5 sm:gap-2 rounded-lg border-2 p-3 sm:p-4 transition-all ${
									theme === "system"
										? "border-primary bg-primary/5"
										: "border-border hover:border-primary/50 hover:bg-muted/50"
								}`}
							>
								<Monitor className={`h-5 w-5 sm:h-6 sm:w-6 ${theme === "system" ? "text-primary" : "text-muted-foreground"}`} />
								<span className={`text-xs sm:text-sm font-medium ${theme === "system" ? "text-primary" : "text-foreground"}`}>
									Sistema
								</span>
							</button>
						</div>
						<p className="text-xs text-muted-foreground">
							{theme === "system" 
								? "O tema será ajustado automaticamente de acordo com as preferências do seu sistema operacional."
								: theme === "dark"
								? "O tema escuro está ativo. Ideal para ambientes com pouca luz."
								: "O tema claro está ativo. Ideal para ambientes bem iluminados."
							}
						</p>
					</div>
				</CardContent>
			</Card>

			<Card className="mb-6">
				<CardHeader className="border-b">
					<CardTitle>Informações da Household</CardTitle>
					<CardDescription>
						Detalhes sobre sua household atual
					</CardDescription>
				</CardHeader>
				<CardContent className="pt-6">
					<div className="space-y-3">
						<div>
							<div className="text-sm font-medium text-muted-foreground">Nome</div>
							<div className="text-lg font-semibold">{currentHousehold?.name}</div>
						</div>
						<div>
							<div className="text-sm font-medium text-muted-foreground">Permissão</div>
							<div className="text-sm">
								{isOwner ? (
									<span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
										Dono
									</span>
								) : (
									<span className="inline-flex items-center rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
										Membro
									</span>
								)}
							</div>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card>
				<CardHeader className="border-b">
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<CardTitle>Tipos de Refeições</CardTitle>
							<CardDescription>
								Configure os tipos de refeições disponíveis para o plano semanal
							</CardDescription>
						</div>
						{isOwner && (
							<button 
								onClick={openCreateDialog}
								className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white hover:bg-primary/80  border border-transparent hover:border-gray-200 transition-colors duration-150"
							>
								<Plus className="mr-2 h-4 w-4" />
								Adicionar
							</button>
						)}
					</div>
				</CardHeader>

				<CardContent className="pt-6">
					{loading ? (
						<LoadingState message="Carregando tipos de refeição..." />
					) : mealTypes.length === 0 ? (
						<div className="text-center py-8 text-muted-foreground">
							<p>Nenhum tipo de refeição cadastrado.</p>
							{isOwner && (
								<p className="text-sm mt-2">
									Clique em "Adicionar" para criar o primeiro.
								</p>
							)}
						</div>
					) : (
						<div className="space-y-2">
							{mealTypes.map((mealType, index) => (
								<div
									key={mealType.id}
									className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-md border border-border px-3 sm:px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
								>
									{isOwner && (
										<div className="hidden sm:flex flex-col">
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() => handleReorder(mealType, "up")}
												disabled={index === 0}
											>
												<ChevronUp className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												className="h-6 w-6"
												onClick={() => handleReorder(mealType, "down")}
												disabled={index === mealTypes.length - 1}
											>
												<ChevronDown className="h-4 w-4" />
											</Button>
										</div>
									)}
									
									<div className="flex-1">
										<div className="font-medium">{mealType.name}</div>
										<div className="text-xs text-muted-foreground">
											Ordem: {mealType.order}
										</div>
									</div>

									{isOwner && (
										<div className="flex items-center gap-1 justify-end">
											<div className="flex sm:hidden items-center gap-1 mr-2">
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleReorder(mealType, "up")}
													disabled={index === 0}
												>
													<ChevronUp className="h-4 w-4" />
												</Button>
												<Button
													variant="ghost"
													size="icon"
													className="h-8 w-8"
													onClick={() => handleReorder(mealType, "down")}
													disabled={index === mealTypes.length - 1}
												>
													<ChevronDown className="h-4 w-4" />
												</Button>
											</div>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => openEditDialog(mealType)}
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => handleDelete(mealType)}
												className="hover:text-destructive hover:bg-destructive/10 transition-colors"
											>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{editingMealType ? "Editar" : "Adicionar"} Tipo de Refeição
						</DialogTitle>
						<DialogDescription>
							{editingMealType
								? "Atualize o nome e ordem do tipo de refeição"
								: "Crie um novo tipo de refeição para sua household"}
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4 py-4">
						<div className="space-y-2">
							<Label htmlFor="name">Nome</Label>
							<Input
								id="name"
								value={formData.name}
								onChange={(e) =>
									setFormData({ ...formData, name: e.target.value })
								}
								placeholder="Ex: Lanche da tarde"
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="order">Ordem</Label>
							<Input
								id="order"
								type="number"
								value={formData.order || ""}
								onChange={(e) =>
									setFormData({
										...formData,
										order: e.target.value ? Number(e.target.value) : undefined,
									})
								}
								placeholder="Ex: 4"
							/>
							<p className="text-xs text-muted-foreground">
								Define a ordem de exibição no plano semanal
							</p>
						</div>
					</div>

					<DialogFooter>
						<Button
							variant="outline"
							onClick={() => setDialogOpen(false)}
							disabled={saving}
						>
							Cancelar
						</Button>
						<Button onClick={handleSave} disabled={saving}>
							{saving ? "Salvando..." : "Salvar"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</PageContainer>
	);
}
