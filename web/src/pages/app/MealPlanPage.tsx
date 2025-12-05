import { useEffect, useMemo, useState } from "react";
import moment, { type Moment } from "moment";
import { apiFetch } from "@/services/api";
import { useHouseholdContext } from "@/context/HouseholdContext";
import type { MealType } from "@/types/mealTypes";
import { PageHeader, PageContainer, ErrorMessage, LoadingState } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import {
	Select,
	SelectTrigger,
	SelectValue,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";

type Recipe = {
	id: number;
	name: string;
};

type MealPlanItem = {
	id: number;
	date: string;
	meal_type: string | null;
	meal_type_id: number | null;
	recipe_id: number;
	recipe: Recipe;
	meal_type_obj?: MealType;
};

type MealPlan = {
	id: number;
	household_id: number;
	week_start_date: string;
	week_label?: string | null;
	items: MealPlanItem[];
};


type CellMap = Record<string, number[]>;

const makeKey = (dateStr: string, mealTypeId: number) => `${dateStr}::${mealTypeId}`;

export function MealPlanPage() {
	const { currentHousehold, isOwner } = useHouseholdContext();
	const [weekStart, setWeekStart] = useState<Moment>(() =>
		moment().startOf("isoWeek")
	);
	const [recipes, setRecipes] = useState<Recipe[]>([]);
	const [loadingRecipes, setLoadingRecipes] = useState(false);
	const [mealTypes, setMealTypes] = useState<MealType[]>([]);
	const [loadingMealTypes, setLoadingMealTypes] = useState(false);

	const [mealPlanId, setMealPlanId] = useState<number | null>(null);
	const [cells, setCells] = useState<CellMap>({});
	const [loadingPlan, setLoadingPlan] = useState(false);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);


	const days = useMemo(
		() =>
			Array.from({ length: 7 }, (_, i) => moment(weekStart).add(i, "day")),
		[weekStart]
	);


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

	async function loadRecipes() {
		try {
			setLoadingRecipes(true);
			const data = await apiFetch<{ data: Recipe[] }>("/recipes/search", {
				method: "POST",
				data: {
					household_id: currentHousehold?.id,
					q: null,
				},
			});
			setRecipes(data.data);
		} catch (err) {
			console.error("Failed to load recipes", err);
		} finally {
			setLoadingRecipes(false);
		}
	}

	async function loadMealTypes() {
		try {
			setLoadingMealTypes(true);
			const data = await apiFetch<MealType[]>("/meal-types", {
				method: "GET",
				params: { household_id: currentHousehold?.id },
			});
			setMealTypes(data);
		} catch (err) {
			console.error("Failed to load meal types", err);
		} finally {
			setLoadingMealTypes(false);
		}
	}

	async function loadMealPlan() {
		setLoadingPlan(true);
		setError(null);

		try {
			const data = await apiFetch<MealPlan>("/meal-plans/search", {
				method: "POST",
				data: { household_id: currentHousehold?.id, week: weekLabel },
			});

			setMealPlanId(data.id);
			const nextCells: CellMap = {};
			

			data.items.forEach((item) => {
				const dateStr = item.date.split("T")[0];
				const mealTypeId = item.meal_type_id || 0;
				const key = makeKey(dateStr, mealTypeId);
				
				if (!nextCells[key]) {
					nextCells[key] = [];
				}
				nextCells[key].push(item.recipe_id);
			});
			
			setCells(nextCells);
		} catch (err: any) {
			const message = err?.message ?? "";
			if (message.toLowerCase().includes("nenhum plano")) {
				setMealPlanId(null);
				setCells({});
				setError(null);
			} else {
				console.error(err);
				setMealPlanId(null);
				setCells({});
				setError(message || "Erro ao carregar plano da semana.");
			}
		} finally {
			setLoadingPlan(false);
		}
	}

	useEffect(() => {
		if (currentHousehold?.id) {
			loadRecipes();
			loadMealTypes();
		}
	}, [currentHousehold?.id]);

	useEffect(() => {
		loadMealPlan();
	}, [weekLabel, currentHousehold?.id]);

	function handleChangeCell(day: Moment, mealTypeId: number, recipeIds: number[]) {
		const dateStr = day.format("YYYY-MM-DD");
		const key = makeKey(dateStr, mealTypeId);

		setCells((prev) => ({
			...prev,
			[key]: recipeIds.filter(id => id > 0),
		}));
	}

	function goToOtherWeek(delta: number) {
		setWeekStart((prev) => moment(prev).add(delta, "week").startOf("isoWeek"));
	}

	async function handleSave() {
		setSaving(true);
		setError(null);

		try {
			const weekStartStr = weekStart.format("YYYY-MM-DD");
			const itemsPayload: {
				date: string;
				meal_type_id: number;
				recipe_id: number;
			}[] = [];


			Object.entries(cells).forEach(([key, recipeIds]) => {
				if (!recipeIds || recipeIds.length === 0) return;
				const [date, mealTypeIdStr] = key.split("::");
				const mealTypeId = Number(mealTypeIdStr);
				
				recipeIds.forEach(recipeId => {
					itemsPayload.push({ 
						date, 
						meal_type_id: mealTypeId, 
						recipe_id: recipeId 
					});
				});
			});

			const payload: any = {
				household_id: currentHousehold?.id,
				week_start: weekStartStr,
				name: `Semana ${weekLabel}`,
				notes: null,
				items: itemsPayload,
			};
			
			if (mealPlanId) {
				await apiFetch(`/meal-plans/${mealPlanId}`, {
					method: "PUT",
					data: payload,
				});
			} else {
				const created = await apiFetch<MealPlan>("/meal-plans", {
					method: "POST",
					data: payload,
				});
				setMealPlanId(created.id);
			}
		} catch (err: any) {
			console.error(err);
			setError(err.message ?? "Erro ao salvar plano semanal.");
		} finally {
			setSaving(false);
		}
	}

	return (
		<PageContainer>
			<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
				<PageHeader
					title="Plano Semanal"
					description="Defina as receitas de cada refeição para a semana."
				/>

				<div className="flex items-center justify-center gap-3 rounded-lg border border-border bg-card px-4 py-2">
					<Button
						variant="ghost"
						size="icon"
						onClick={() => goToOtherWeek(-1)}
						className="h-8 w-8"
					>
						<ChevronLeft className="h-5 w-5" />
					</Button>
					<div className="min-w-[200px] text-center text-sm font-semibold">
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
			</div>

			{error && (
				<ErrorMessage message={error} onDismiss={() => setError(null)} />
			)}

			<Card className="flex flex-1 flex-col">
				<CardHeader className="border-b">
					<CardTitle>Semana {weekLabel}</CardTitle>
					<CardDescription>
						{isOwner 
							? "Adicione múltiplas receitas para cada refeição. Clique em '+ Adicionar' para incluir mais pratos."
							: "Visualize o plano de refeições da semana."
						}
					</CardDescription>
				</CardHeader>

				<CardContent className="flex flex-1 flex-col gap-4 overflow-hidden pt-6">
					{(loadingPlan || loadingRecipes || loadingMealTypes) && (
						<LoadingState message="Carregando dados da semana..." />
					)}

					{!loadingPlan && !loadingRecipes && !loadingMealTypes && (
						<>
							<div className="flex-1 overflow-x-auto rounded-lg border border-border bg-muted/20">
								<table className="w-full border-collapse">
										<thead className="sticky top-0 z-10">
											<tr className="bg-muted/60 hover:bg-gray-50 dark:hover:bg-gray-900/50">
											<th className="sticky left-0 z-20 w-32 border-b border-r border-border bg-muted/60 px-4 py-3 text-left text-sm font-semibold text-foreground">
												Refeição
											</th>

											{days.map((d) => (
												<th
													key={d.format("YYYY-MM-DD")}
													className="border-b border-border px-3 py-3 text-center text-sm font-semibold text-foreground whitespace-nowrap min-w-[140px]"
												>
													<div className="text-sm font-semibold">
														{d.format("ddd")}
													</div>
													<div className="text-xs text-muted-foreground">
														{d.format("DD/MM")}
													</div>
												</th>
											))}
										</tr>
									</thead>

									<tbody>
									{mealTypes.map((mealType, mealIdx) => (
										<tr
											key={mealType.id}
											className={`hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
												mealIdx % 2 === 0 ? "bg-background" : "bg-muted/5"
											}`}
										>
												<td className="sticky left-0 z-10 border-t border-r border-border bg-inherit px-4 py-4 text-sm font-semibold text-foreground whitespace-nowrap">
													{mealType.name}
												</td>

												{days.map((d) => {
													const dateStr = d.format("YYYY-MM-DD");
													const key = makeKey(dateStr, mealType.id);
													const recipeIds = cells[key] || [];

													return (
														<td
															key={key}
															className="border-t border-border px-2 py-2 align-top min-w-[160px]"
														>
															<div className="space-y-1">
																{recipeIds.length === 0 && !isOwner ? (
																	<div className="text-xs text-muted-foreground text-center py-2">
																		-
																	</div>
																) : (
																	recipeIds.map((recipeId, idx) => {
																	const recipe = recipes.find((r) => r.id === recipeId);
																	return (
																		<div
																			key={idx}
																			className="flex items-center gap-1 bg-muted/50 rounded px-2 py-1"
																		>
																			<span className="flex-1 text-xs truncate">
																				{recipe?.name || "?"}
																			</span>
																			{isOwner && (
																				<button
																					onClick={() => {
																						const newIds = recipeIds.filter((_, i) => i !== idx);
																						handleChangeCell(d, mealType.id, newIds);
																					}}
																					className="text-destructive hover:text-destructive/80"
																				>
																					<Trash2 className="h-3 w-3" />
																				</button>
																			)}
																		</div>
																	);
																})
																)}

																{isOwner && (
																	<Select
																		value=""
																		onValueChange={(recipeIdStr) => {
																			const recipeId = Number(recipeIdStr);
																			if (recipeId > 0) {
																				handleChangeCell(d, mealType.id, [...recipeIds, recipeId]);
																			}
																		}}
																		disabled={!isOwner}
																	>
																		<SelectTrigger className="h-8 w-full text-xs hover:bg-accent transition-colors">
																			<SelectValue placeholder="+ Adicionar" />
																		</SelectTrigger>
																		<SelectContent>
																	{recipes.length === 0 ? (
																		<SelectItem
																			disabled
																			value="__none__"
																			className="text-xs text-muted-foreground"
																		>
																			Nenhuma receita cadastrada
																		</SelectItem>
																	) : (
																		recipes
																			.filter((r) => !recipeIds.includes(r.id))
																			.map((r) => (
																				<SelectItem
																					key={r.id}
																					value={String(r.id)}
																					className="text-xs cursor-pointer"
																				>
																					{r.name}
																				</SelectItem>
																			))
																	)}
																		</SelectContent>
																	</Select>
																)}
															</div>
														</td>
													);
												})}
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="flex justify-end pt-2">
							<button
								onClick={handleSave}
								disabled={!isOwner || saving || loadingPlan || loadingRecipes}
								className="inline-flex items-center justify-center rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white hover:bg-primary/80  border border-transparent hover:border-gray-200 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary/80 disabled:hover:text-white min-w-[220px]"
							>
									{saving ? (
										<>
											<Loader2 className="mr-2 h-5 w-5 animate-spin" />
											Salvando...
										</>
									) : (
										"Salvar plano da semana"
									)}
								</button>
							</div>
						</>
					)}
				</CardContent>
			</Card>
		</PageContainer>
	);
}
