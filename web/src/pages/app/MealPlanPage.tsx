import { useEffect, useMemo, useState } from "react";
import moment, { type Moment } from "moment";
import { apiFetch } from "@/services/api";
import { useHouseholdContext } from "@/context/HouseholdContext";
import type { MealType } from "@/types/mealTypes";
import { PageHeader, PageContainer, ErrorMessage, LoadingState } from "@/components/common";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
} from "@/components/ui/card";
import {
	Select,
	SelectTrigger,
	SelectContent,
	SelectItem,
} from "@/components/ui/select";
import { Loader2, ChevronLeft, ChevronRight, X, Plus, CalendarDays } from "lucide-react";

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

const dayNames = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

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
		return `${weekStart.format("DD MMM")} – ${end.format("DD MMM")}`;
	}, [weekStart]);

	const isCurrentWeek = useMemo(() => {
		const now = moment().startOf("isoWeek");
		return weekStart.isSame(now, "day");
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

	function goToCurrentWeek() {
		setWeekStart(moment().startOf("isoWeek"));
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

	const isLoading = loadingPlan || loadingRecipes || loadingMealTypes;

	function DayCard({ day, dayIdx, compact = false }: { day: Moment; dayIdx: number; compact?: boolean }) {
		const isToday = day.isSame(moment(), "day");
		const dateStr = day.format("YYYY-MM-DD");

		return (
			<div className="flex flex-col">
				<div className={`text-center py-2 px-2 rounded-t-lg border border-b-0 ${isToday
					? "bg-primary text-primary-foreground border-primary"
					: "bg-muted border-border"
					}`}>
					<div className={`font-medium ${compact ? "text-sm" : "text-xs opacity-80"}`}>
						{compact ? `${dayNames[dayIdx]}, ` : dayNames[dayIdx]}
						<span className={compact ? "font-bold" : ""}>{day.format("DD/MM")}</span>
					</div>
					{!compact && (
						<div className={`text-lg font-bold ${isToday ? "" : "text-foreground"}`}>
							{day.format("DD")}
						</div>
					)}
				</div>

				<Card className={`flex-1 rounded-t-none border-t-0 ${isToday ? "border-primary/50" : ""}`}>
					<CardContent className={`space-y-3 ${compact ? "p-3" : "p-2 space-y-2"}`}>
						{mealTypes.map((mealType) => {
							const key = makeKey(dateStr, mealType.id);
							const recipeIds = cells[key] || [];

							return (
								<div key={mealType.id} className="space-y-1.5">
									<div className={`font-semibold text-muted-foreground uppercase tracking-wide ${compact ? "text-xs" : "text-[10px]"
										}`}>
										{mealType.name}
									</div>

									<div className="space-y-1.5">
										{recipeIds.map((recipeId, idx) => {
											const recipe = recipes.find((r) => r.id === recipeId);
											return (
												<div
													key={idx}
													className={`group flex items-center gap-2 bg-primary/10 text-primary rounded-md ${compact ? "px-3 py-2 text-sm" : "px-2 py-1.5 text-xs"
														}`}
												>
													<span className="flex-1 truncate font-medium">
														{recipe?.name || "?"}
													</span>
													{isOwner && (
														<button
															onClick={() => {
																const newIds = recipeIds.filter((_, i) => i !== idx);
																handleChangeCell(day, mealType.id, newIds);
															}}
															className="opacity-60 hover:opacity-100 text-primary/60 hover:text-destructive transition-opacity"
														>
															<X className={compact ? "h-4 w-4" : "h-3 w-3"} />
														</button>
													)}
												</div>
											);
										})}

										{isOwner && (
											<Select
												value=""
												onValueChange={(recipeIdStr) => {
													const recipeId = Number(recipeIdStr);
													if (recipeId > 0) {
														handleChangeCell(day, mealType.id, [...recipeIds, recipeId]);
													}
												}}
											>
												<SelectTrigger className={`w-full border-dashed bg-transparent hover:bg-muted/50 ${compact ? "h-9 text-sm" : "h-7 text-[10px]"
													}`}>
													<Plus className={compact ? "h-4 w-4 mr-1.5" : "h-3 w-3 mr-1"} />
													<span className="text-muted-foreground">Adicionar</span>
												</SelectTrigger>
												<SelectContent>
													{recipes.length === 0 ? (
														<SelectItem
															disabled
															value="__none__"
															className="text-sm text-muted-foreground"
														>
															Nenhuma receita
														</SelectItem>
													) : (
														recipes
															.filter((r) => !recipeIds.includes(r.id))
															.map((r) => (
																<SelectItem
																	key={r.id}
																	value={String(r.id)}
																	className="text-sm"
																>
																	{r.name}
																</SelectItem>
															))
													)}
												</SelectContent>
											</Select>
										)}

										{!isOwner && recipeIds.length === 0 && (
											<div className={`text-muted-foreground/50 text-center py-2 ${compact ? "text-sm" : "text-[10px]"
												}`}>
												Nenhuma receita
											</div>
										)}
									</div>
								</div>
							);
						})}

						{mealTypes.length === 0 && (
							<div className="text-sm text-muted-foreground text-center py-4">
								Configure os tipos de refeição nas configurações
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<PageContainer>
			<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
				<PageHeader
					title="Plano Semanal"
					description="Organize suas refeições da semana"
				/>

				<div className="flex items-center gap-2 justify-center">
					{!isCurrentWeek && (
						<Button
							variant="outline"
							size="sm"
							onClick={goToCurrentWeek}
							className="text-xs"
						>
							<CalendarDays className="mr-1.5 h-3.5 w-3.5" />
							Hoje
						</Button>
					)}
					<div className="flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-3 py-2 sm:justify-start">
						<Button
							variant="ghost"
							size="icon"
							onClick={() => goToOtherWeek(-1)}
							className="h-8 w-8"
						>
							<ChevronLeft className="h-5 w-5" />
						</Button>
						<div className="min-w-[140px] sm:min-w-[200px] text-center text-sm font-semibold">
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
			</div>

			{error && (
				<ErrorMessage message={error} onDismiss={() => setError(null)} />
			)}

			{isLoading ? (
				<LoadingState message="Carregando plano da semana..." />
			) : (
				<>
					<div className="lg:hidden space-y-4">
						{days.map((day, dayIdx) => (
							<DayCard key={day.format("YYYY-MM-DD")} day={day} dayIdx={dayIdx} compact={true} />
						))}
					</div>

					<div className="hidden lg:grid lg:grid-cols-7 gap-2">
						{days.map((day, dayIdx) => (
							<DayCard key={day.format("YYYY-MM-DD")} day={day} dayIdx={dayIdx} compact={false} />
						))}
					</div>

					{isOwner && (
						<div className="flex justify-end pt-2">
							<Button
								onClick={handleSave}
								disabled={saving}
								size="lg"
								className="w-full sm:w-auto"
							>
								{saving ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Salvando...
									</>
								) : (
									"Salvar plano"
								)}
							</Button>
						</div>
					)}
				</>
			)}
		</PageContainer>
	);
}
