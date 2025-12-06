import { useEffect, useMemo, useState } from "react";
import moment, { type Moment } from "moment";

import { apiFetch } from "@/services/api";
import { useHouseholdContext } from "@/context/HouseholdContext";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { PageHeader, PageContainer, ErrorMessage, LoadingState } from "@/components/common";

type Ingredient = {
	id: number;
	name: string;
};

type ShoppingListItem = {
	id: number;
	shopping_list_id: number;
	ingredient_id: number;
	needed_quantity: string;
	pantry_quantity: string;
	to_buy_quantity: string;
	unit: string | null;
	notes: string | null;
	ingredient: Ingredient;
};

type ShoppingList = {
	id: number;
	household_id: number;
	meal_plan_id: number | null;
	name: string;
	notes: string | null;
	status: string;
	items: ShoppingListItem[];
};

type ItemExtraState = {
	estimatedPrice: string;
	status: "pending" | "bought";
};

type ItemExtraMap = Record<number, ItemExtraState>;

function getExtrasStorageKey(shoppingListId: number) {
	return `shopping_list_extras_${shoppingListId}`;
}

function loadExtrasFromStorage(shoppingListId: number): ItemExtraMap {
	try {
		const raw = localStorage.getItem(getExtrasStorageKey(shoppingListId));
		if (!raw) return {};
		return JSON.parse(raw);
	} catch {
		return {};
	}
}

function saveExtrasToStorage(shoppingListId: number, extras: ItemExtraMap) {
	localStorage.setItem(
		getExtrasStorageKey(shoppingListId),
		JSON.stringify(extras)
	);
}

export function ShoppingListsPage() {
	const { currentHousehold } = useHouseholdContext();
	const [weekStart, setWeekStart] = useState<Moment>(() =>
		moment().startOf("isoWeek")
	);
	const [shoppingList, setShoppingList] = useState<ShoppingList | null>(null);
	const [extras, setExtras] = useState<ItemExtraMap>({});
	const [loading, setLoading] = useState(false);
	const [generating, setGenerating] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [shouldLoadOnWeekChange, setShouldLoadOnWeekChange] = useState(true);

	const weekLabel = useMemo(() => {
		const year = weekStart.isoWeekYear();
		const week = String(weekStart.isoWeek()).padStart(2, "0");
		return `${year}-W${week}`;
	}, [weekStart]);

	const weekRangeLabel = useMemo(() => {
		const end = moment(weekStart).add(6, "day");
		return `${weekStart.format("DD [de] MMM.")} – ${end.format(
			"DD [de] MMM."
		)}`;
	}, [weekStart]);

	function goToOtherWeek(delta: number) {
		setWeekStart((prev) => moment(prev).add(delta, "week").startOf("isoWeek"));
		setShouldLoadOnWeekChange(true);
	}


	useEffect(() => {
		if (!shoppingList) return;
		const stored = loadExtrasFromStorage(shoppingList.id);
		const next: ItemExtraMap = {};

		shoppingList.items.forEach((item) => {
			const existing = stored[item.id];
			next[item.id] = existing ?? {
				estimatedPrice: "",
				status: "pending",
			};
		});

		setExtras(next);
	}, [shoppingList]);

	async function loadShoppingList() {
		setLoading(true);
		setError(null);

		try {
			const data = await apiFetch<ShoppingList>("/shopping-lists/search", {
				method: "POST",
				data: {
					household_id: currentHousehold?.id,
					week: weekLabel,
				},
			});
			console.log("Loaded shopping list:", data);
			setShoppingList(data);
			setShouldLoadOnWeekChange(false);
		} catch (err: any) {
			const message = err?.message ?? "";

			if (message.toLowerCase().includes("nenhuma lista")) {
				setShoppingList(null);
				setError(null);
			} else {
				console.error(err);
				setShoppingList(null);
				setError(message || "Erro ao carregar lista de compras.");
			}
		} finally {
			setLoading(false);
			setShouldLoadOnWeekChange(false);
		}
	}

	function updateExtra(
		itemId: number,
		field: keyof ItemExtraState,
		value: string
	) {
		if (!shoppingList) return;

		setExtras((prev) => {
			const current = prev[itemId] ?? {
				estimatedPrice: "",
				status: "pending",
			};
			const next: ItemExtraMap = {
				...prev,
				[itemId]: {
					...current,
					[field]:
						field === "status" ? (value as ItemExtraState["status"]) : value,
				},
			};

			saveExtrasToStorage(shoppingList.id, next);
			return next;
		});
	}

	async function generateListFromWeek() {
		setGenerating(true);
		setError(null);
		setShoppingList(null);

		try {

			const mealPlan = await apiFetch<{
				id: number;
			}>("/meal-plans/search", {
				method: "POST",
				data: {
					household_id: currentHousehold?.id,
					week: weekLabel,
				},
			});


			const list = await apiFetch<ShoppingList>(
				`/shopping-lists/from-meal-plan/${mealPlan.id}`,
				{
					method: "POST",
				}
			);

			setShoppingList(list);
			setShouldLoadOnWeekChange(false);
		} catch (err: any) {
			console.error(err);
			const message =
				err.message ??
				"Erro ao gerar lista de compras. Verifique se existe um plano de refeições para a semana.";
			setError(message);
		} finally {
			setGenerating(false);
		}
	}

	useEffect(() => {
		if (shouldLoadOnWeekChange) {
			setShoppingList(null);
			loadShoppingList();
		}
	}, [weekLabel, currentHousehold?.id]);

	const totalEstimated = useMemo(() => {
		if (!shoppingList) return 0;
		return shoppingList.items.reduce((sum, item) => {
			const extra = extras[item.id];
			const val = extra?.estimatedPrice
				? Number(extra.estimatedPrice.replace(",", "."))
				: 0;
			if (isNaN(val)) return sum;
			return sum + val;
		}, 0);
	}, [shoppingList, extras]);

	return (
		<PageContainer>
			<div className="flex flex-col gap-4">
				<PageHeader
					title="Lista de compras"
					description="Gere a lista com base no plano semanal e marque o que já foi comprado."
				/>

				<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => goToOtherWeek(-1)}
							className="h-8 w-8"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<div className="min-w-[180px] sm:min-w-[200px] text-center text-sm font-semibold">
							{weekRangeLabel}
						</div>
						<Button
							variant="ghost"
							size="icon"
							onClick={() => goToOtherWeek(1)}
							className="h-8 w-8"
						>
							<ChevronRight className="h-5 w-5" />
						</Button>
					</div>

					<button
						onClick={generateListFromWeek}
						disabled={generating}
						className="inline-flex items-center justify-center rounded-lg bg-primary px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold text-white hover:bg-primary/80 border border-transparent hover:border-gray-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/80 disabled:hover:text-white"
					>
						{generating ? (
							<>
								<Loader2 className="mr-2 h-4 w-4 sm:h-5 sm:w-5 animate-spin" />
								Gerando...
							</>
						) : (
							"Gerar lista"
						)}
					</button>
				</div>
			</div>

			{error && (
				<ErrorMessage message={error} onDismiss={() => setError(null)} />
			)}

			<Card className="flex flex-col">
				<CardHeader className="border-b">
					<CardTitle>
						{shoppingList ? shoppingList.name : "Nenhuma lista gerada ainda"}
					</CardTitle>
					<CardDescription>
						{shoppingList
							? "Revise os itens, estime valores e marque o que já foi comprado."
							: "Gere uma lista com base no plano de refeições da semana selecionada."}
					</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-col gap-4 pt-6">
					{loading && (
						<LoadingState message="Carregando lista de compras..." />
					)}

					{!shoppingList && !loading && (
						<p className="text-sm text-muted-foreground">
							Nenhuma lista para exibir. Selecione uma semana e clique em
							&quot;Gerar lista da semana&quot;.
						</p>
					)}

					{shoppingList && (
						<>
							<div className="hidden md:block w-full overflow-x-auto rounded-lg border border-border bg-muted/20">
								<div className="min-w-[700px] space-y-2 p-3">
									<div className="grid grid-cols-[40%_15%_20%_25%] rounded-md bg-muted/60 px-3 py-2 text-xs font-semibold text-muted-foreground">
										<span>Ingrediente</span>
										<span className="text-center">Comprar</span>
										<span className="text-center">Estimativa (R$)</span>
										<span className="text-right">Status</span>
									</div>

									<div className="space-y-2">
										{shoppingList.items.map((item) => {
											const extra = extras[item.id] ?? {
												estimatedPrice: "",
												status: "pending" as const,
											};

											const isBought = extra.status === "bought";

											const rowClasses = isBought
												? "border-emerald-300/60 bg-emerald-50 dark:bg-emerald-900/20"
												: "border-border";

											return (
												<div
													key={item.id}
													className={`grid grid-cols-[40%_15%_20%_25%] rounded-md border px-3 py-2 text-sm transition-colors ${rowClasses}`}
												>
													<div className="min-w-0">
														<div className="font-medium truncate">
															{item.ingredient.name}
														</div>
														<div className="text-[11px] text-muted-foreground">
															Precisa:{" "}
															{Number(item.needed_quantity).toLocaleString(
																"pt-BR",
																{ maximumFractionDigits: 2 }
															)}{" "}
															{item.unit ?? ""} • Despensa:{" "}
															{Number(item.pantry_quantity).toLocaleString(
																"pt-BR",
																{ maximumFractionDigits: 2 }
															)}{" "}
															{item.unit ?? ""}
														</div>
													</div>

													<div className="flex items-center justify-center">
														<span className="font-medium">
															{Number(item.to_buy_quantity).toLocaleString(
																"pt-BR",
																{ maximumFractionDigits: 2 }
															)}{" "}
															{item.unit ?? ""}
														</span>
													</div>

													<div className="flex items-center justify-center">
														<Input
															className="h-8 max-w-[120px] text-right text-sm"
															placeholder="0,00"
															value={extra.estimatedPrice}
															onChange={(e) =>
																updateExtra(
																	item.id,
																	"estimatedPrice",
																	e.target.value
																)
															}
														/>
													</div>

													<div className="flex items-center justify-end gap-2">
														<Select
															value={extra.status}
															onValueChange={(value) =>
																updateExtra(item.id, "status", value)
															}
														>
															<SelectTrigger className="h-8 w-[130px] text-xs">
																<SelectValue />
															</SelectTrigger>
															<SelectContent>
																<SelectItem value="pending">
																	Pendente
																</SelectItem>
																<SelectItem value="bought">
																	Comprado
																</SelectItem>
															</SelectContent>
														</Select>

														{isBought && (
															<span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-200">
																✓
															</span>
														)}
													</div>
												</div>
											);
										})}
									</div>
								</div>
							</div>

							<div className="md:hidden space-y-3">
								{shoppingList.items.map((item) => {
									const extra = extras[item.id] ?? {
										estimatedPrice: "",
										status: "pending" as const,
									};

									const isBought = extra.status === "bought";

									const cardClasses = isBought
										? "border-emerald-300/60 bg-emerald-50 dark:bg-emerald-900/20"
										: "border-border";

									return (
										<div
											key={item.id}
											className={`rounded-lg border p-4 transition-colors ${cardClasses}`}
										>
											<div className="flex items-start justify-between gap-2">
												<div className="flex-1 min-w-0">
													<div className="font-medium text-sm">
														{item.ingredient.name}
													</div>
													<div className="text-xs text-muted-foreground mt-0.5">
														Precisa: {Number(item.needed_quantity).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} {item.unit ?? ""}
													</div>
												</div>
												{isBought && (
													<span className="text-emerald-600 dark:text-emerald-400 text-lg">✓</span>
												)}
											</div>

											<div className="mt-3 flex items-center justify-between gap-3 text-sm">
												<div className="flex items-center gap-1">
													<span className="text-muted-foreground">Comprar:</span>
													<span className="font-semibold text-primary">
														{Number(item.to_buy_quantity).toLocaleString("pt-BR", { maximumFractionDigits: 2 })} {item.unit ?? ""}
													</span>
												</div>
												<div className="text-xs text-muted-foreground">
													Despensa: {Number(item.pantry_quantity).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}
												</div>
											</div>

											<div className="mt-3 pt-3 border-t border-border/50 flex flex-col sm:flex-row gap-2">
												<div className="flex-1">
													<label className="text-xs text-muted-foreground mb-1 block">Estimativa (R$)</label>
													<Input
														className="h-9 text-sm"
														placeholder="0,00"
														value={extra.estimatedPrice}
														onChange={(e) =>
															updateExtra(item.id, "estimatedPrice", e.target.value)
														}
													/>
												</div>
												<div className="flex-1">
													<label className="text-xs text-muted-foreground mb-1 block">Status</label>
													<Select
														value={extra.status}
														onValueChange={(value) =>
															updateExtra(item.id, "status", value)
														}
													>
														<SelectTrigger className="h-9 text-sm">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value="pending">Pendente</SelectItem>
															<SelectItem value="bought">Comprado</SelectItem>
														</SelectContent>
													</Select>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							<div className="flex items-center justify-end rounded-lg border border-border bg-muted/30 px-4 py-3">
								<span className="mr-3 text-sm text-muted-foreground">
									Total estimado:
								</span>
								<span className="font-semibold text-foreground text-lg">
									R${" "}
									{totalEstimated.toLocaleString("pt-BR", {
										minimumFractionDigits: 2,
										maximumFractionDigits: 2,
									})}
								</span>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</PageContainer>
	);
}
