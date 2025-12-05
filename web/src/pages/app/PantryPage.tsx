
import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "@/services/api";
import { useHouseholdContext } from "@/context/HouseholdContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2 } from "lucide-react";
import moment from "moment";
import { PageHeader, PageContainer, ErrorMessage, LoadingState } from "@/components/common";

type Ingredient = {
	id: number;
	name: string;
	default_unit: string | null;
};

type PantryItem = {
	id: number;
	household_id: number;
	ingredient_id: number;
	quantity: string;
	unit: string | null;
	expires_at: string | null;
	notes: string | null;
	ingredient: Ingredient;
};

type PantryFormState = {
	id?: number;
	ingredientId: string;
	quantity: string;
	expiresAt: string;
	notes: string;
};

type StatusInfo = {
	label: string;
	variant: "ok" | "near" | "expired" | "no-date";
};

function computeStatus(expiresAt: string | null): StatusInfo {
	if (!expiresAt) {
		return { label: "Sem validade", variant: "no-date" };
	}

	const today = moment().startOf("day");
	const exp = moment(expiresAt, "YYYY-MM-DD").startOf("day");

	const diffDays = exp.diff(today, "days");

	if (diffDays < 0) {
		return { label: "Vencido", variant: "expired" };
	}

	if (diffDays <= 3) {
		return {
			label: diffDays === 0
				? "Vence hoje"
				: `Vence em ${diffDays} dia(s)`,
			variant: "near",
		};
	}

	return { label: "OK", variant: "ok" };
}

export function PantryPage() {
	const { currentHousehold, isOwner } = useHouseholdContext();
	const [items, setItems] = useState<PantryItem[]>([]);
	const [ingredients, setIngredients] = useState<Ingredient[]>([]);
	const [loading, setLoading] = useState(false);
	const [loadingIngredients, setLoadingIngredients] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const [search, setSearch] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [saving, setSaving] = useState(false);

	const [form, setForm] = useState<PantryFormState>({
		ingredientId: "",
		quantity: "",
		expiresAt: "",
		notes: "",
	});

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

	async function loadPantry() {
		try {
			setLoading(true);
			setError(null);

			const data = await apiFetch<PantryItem[]>("/pantry/search", {
				method: "POST",
				data: {
					household_id: currentHousehold?.id,
				},
			});

			setItems(data);
		} catch (err: any) {
			console.error(err);
			setError(err.message ?? "Erro ao carregar despensa.");
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadIngredients();
		loadPantry();
	}, [currentHousehold?.id]);

	function openCreateDialog() {
		setForm({
			id: undefined,
			ingredientId: "",
			quantity: "",
			expiresAt: "",
			notes: "",
		});
		setIsDialogOpen(true);
	}

	function openEditDialog(item: PantryItem) {
		setForm({
			id: item.id,
			ingredientId: String(item.ingredient_id),
			quantity: item.quantity ?? "",
			expiresAt: item.expires_at ?? "",
			notes: item.notes ?? "",
		});
		setIsDialogOpen(true);
	}

	function handleChangeField<K extends keyof PantryFormState>(
		field: K,
		value: PantryFormState[K]
	) {
		setForm((prev) => ({
			...prev,
			[field]: value,
		}));
	}

	async function handleSave() {
		if (!form.ingredientId) {
			setError("Selecione um ingrediente.");
			return;
		}
		if (!form.quantity) {
			setError("Informe a quantidade.");
			return;
		}

		setSaving(true);
		setError(null);

		try {
			const selectedIngredient = ingredients.find(
				(ing) => String(ing.id) === form.ingredientId
			);

		const payload = {
			household_id: currentHousehold?.id,
			ingredient_id: Number(form.ingredientId),
			quantity: Number(form.quantity),
			unit: selectedIngredient?.default_unit || null,
			expires_at: form.expiresAt || null,
			notes: form.notes || null,
			};

			if (form.id) {
				await apiFetch<PantryItem>(`/pantry/${form.id}`, {
					method: "PUT",
					data: payload,
				});
			} else {
				await apiFetch<PantryItem>("/pantry", {
					method: "POST",
					data: payload,
				});
			}

			setIsDialogOpen(false);
			await loadPantry();
		} catch (err: any) {
			console.error(err);
			setError(err.message ?? "Erro ao salvar item.");
		} finally {
			setSaving(false);
		}
	}

	async function handleDelete(item: PantryItem) {
		if (!window.confirm(`Remover "${item.ingredient.name}" da despensa?`)) {
			return;
		}

		try {
			await apiFetch(`/pantry/${item.id}`, {
				method: "DELETE",
			});
			await loadPantry();
		} catch (err: any) {
			console.error(err);
			alert(err.message ?? "Erro ao remover item.");
		}
	}

	const filteredItems = useMemo(() => {
		if (!search.trim()) return items;
		const term = search.toLowerCase();
		return items.filter((item) =>
			item.ingredient.name.toLowerCase().includes(term)
		);
	}, [items, search]);

	return (
		<PageContainer>
			<PageHeader
				title="Despensa"
				description="Acompanhe o que você tem em casa e fique de olho nos itens perto da validade."
				action={
					isOwner && (
						<button
							onClick={openCreateDialog}
							className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary/80  border border-transparent hover:border-gray-200 transition-colors duration-150"
						>
							<Plus className="mr-2 h-4 w-4" />
							Adicionar item
						</button>
					)
				}
			/>

			{error && (
				<ErrorMessage message={error} onDismiss={() => setError(null)} />
			)}

			<Card>
				<CardHeader className="border-b">
					<div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
						<div>
							<CardTitle>Meus itens</CardTitle>
							<CardDescription>Gerencie os itens da sua despensa</CardDescription>
						</div>
						<Input
							placeholder="Buscar na despensa..."
							className="max-w-xs"
							value={search}
							onChange={(e) => setSearch(e.target.value)}
						/>
					</div>
				</CardHeader>

				<CardContent className="pt-6">
					{loading ? (
						<LoadingState message="Carregando itens da despensa..." />
					) : filteredItems.length === 0 ? (
						<p className="text-sm text-muted-foreground">
							Nenhum item na despensa. Adicione o primeiro item.
						</p>
					) : (
						<div className="space-y-2">
							<div className="hidden md:grid grid-cols-[40%_10%_10%_20%_20%] rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
								<span>Ingrediente</span>
								<span className="text-right">Quantidade</span>
								<span className="text-right">Unidade</span>
								<span className="text-right">Validade</span>
								<span className="text-right">Status</span>
							</div>

							<div className="space-y-2">
								{filteredItems.map((item) => {
									const status = computeStatus(item.expires_at);

									const rowClasses =
										status.variant === "expired"
											? "border-destructive/50 bg-destructive/5"
											: status.variant === "near"
												? "border-amber-400/60 bg-amber-50 dark:bg-amber-900/20"
												: "border-border";

									const badgeClasses =
										status.variant === "expired"
											? "bg-destructive/10 text-destructive border-destructive/40"
											: status.variant === "near"
												? "bg-amber-50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 border-amber-300/60"
												: status.variant === "no-date"
													? "bg-muted text-muted-foreground border-border/60"
													: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200 border-emerald-300/60";

									return (
											<div
												key={item.id}
												className={`grid grid-cols-[40%_10%_10%_20%_20%] rounded-md border px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${rowClasses}`}

											>
											<div>
												<div className="font-medium min-w-0">
													{item.ingredient.name}
												</div>
												{item.notes && (
													<div className="text-[11px] text-muted-foreground">
														{item.notes}
													</div>
												)}
											</div>

											<div className="md:text-right">
												{Number(item.quantity).toLocaleString("pt-BR", {
													minimumFractionDigits: 0,
													maximumFractionDigits: 2,
												})}
											</div>

											<div className="md:text-right">
												{item.unit || item.ingredient.default_unit || "-"}
											</div>

											<div className="md:text-right text-xs">
												{item.expires_at
													? moment(item.expires_at).format("DD/MM/YYYY")
													: "—"}
											</div>

											<div className="flex items-center justify-between gap-2 md:justify-end">
												<span
													className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${badgeClasses}`}
												>
													{status.label}
												</span>

												{isOwner && (
													<div className="flex items-center gap-1">
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7"
															onClick={() => openEditDialog(item)}
														>
															<Pencil className="h-3 w-3" />
														</Button>
														<Button
															variant="ghost"
															size="icon"
															className="h-7 w-7"
															onClick={() => handleDelete(item)}
														>
															<Trash2 className="h-3 w-3 text-destructive" />
														</Button>
													</div>
												)}
											</div>
										</div>
									);
								})}
							</div>
						</div>
					)}
				</CardContent>
			</Card>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-lg">
					<DialogHeader>
						<DialogTitle>
							{form.id ? "Editar item da despensa" : "Adicionar item na despensa"}
						</DialogTitle>
						<DialogDescription>
							Selecione um ingrediente e preencha a quantidade e validade.
						</DialogDescription>
					</DialogHeader>

					<div className="space-y-4">
						<div className="space-y-2 w-full">
							<Label>Ingrediente</Label>
							<Select
								value={form.ingredientId}
								onValueChange={(value) => handleChangeField("ingredientId", value)}
							>
								<SelectTrigger className="w-full">
									<SelectValue placeholder="Selecione um ingrediente" />
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
							{loadingIngredients && (
								<p className="text-[11px] text-muted-foreground">
									Carregando ingredientes...
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label>
								Quantidade
								{form.ingredientId && (
									<span className="text-muted-foreground ml-1">
										(em {ingredients.find((ing) => String(ing.id) === form.ingredientId)?.default_unit || "unidade"})
									</span>
								)}
							</Label>
							<Input
								value={form.quantity}
								onChange={(e) => handleChangeField("quantity", e.target.value)}
								placeholder="ex: 200"
								type="number"
								min="0"
								step="0.01"
							/>
						</div>

						{error && (
							<div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
								{error}
							</div>
						)}

						<div className="space-y-2">
							<Label>Validade (opcional)</Label>
							<Input
								type="date"
								value={
									form.expiresAt
										? moment(form.expiresAt).format("YYYY-MM-DD")
										: ""
								}
								onChange={(e) =>
									handleChangeField("expiresAt", e.target.value)
								}
							/>
						</div>

						<div className="space-y-2">
							<Label>Observações (opcional)</Label>
							<Textarea
								rows={2}
								value={form.notes}
								onChange={(e) => handleChangeField("notes", e.target.value)}
								placeholder="Ex: pacote aberto, guardar na geladeira..."
							/>
						</div>
					</div>

					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							onClick={() => setIsDialogOpen(false)}
						>
							Cancelar
						</Button>
						<Button type="button" onClick={handleSave} disabled={saving}>
							{saving ? "Salvando..." : "Salvar item"}
						</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	</PageContainer>
	);
}