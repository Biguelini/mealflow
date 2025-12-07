export type Household = {
  id: number;
  name: string;
  owner_id: number;
};

export type PantryItem = {
  id: number;
  household_id: number;
  ingredient_id: number;
  quantity: string;
  unit: string | null;
  expires_at: string | null;
  notes: string | null;
  ingredient: {
    id: number;
    name: string;
    default_unit: string | null;
  };
};

export type PantryFormState = {
  id?: number;
  ingredientId: string;
  quantity: string;
  expiresAt: string;
  notes: string;
};

export type ShoppingListItem = {
  id: number;
  shopping_list_id: number;
  ingredient_id: number;
  needed_quantity: string;
  pantry_quantity: string;
  to_buy_quantity: string;
  unit: string | null;
  notes: string | null;
  ingredient: {
    id: number;
    name: string;
  };
};

export type ShoppingList = {
  id: number;
  household_id: number;
  meal_plan_id: number | null;
  name: string;
  notes: string | null;
  status: string;
  items: ShoppingListItem[];
};

export type TopRecipe = {
  recipe_id: number;
  name: string;
  usage_count: number;
};

export type TopIngredient = {
  ingredient_id: number;
  name: string;
  total_quantity: string | number;
};

export type WeeklySummary = {
  planned_meals: number;
  completed_meals: number;
  top_recipes: TopRecipe[];
  top_ingredients: TopIngredient[];
  week_start: string;
  week_end: string;
};

export type MealPlanItem = {
  id: number;
  date: string;
  meal_type: string | null;
  meal_type_id: number | null;
  recipe_id: number;
  recipe: {
    id: number;
    name: string;
  };
};

export type MealPlan = {
  id: number;
  household_id: number;
  week_start_date: string;
  week_label?: string | null;
  items: MealPlanItem[];
};
