export type Ingredient = {
	id: number;
	name: string;
	default_unit: string | null;
};

export type RecipeIngredient = {
	ingredient_id: number;
	quantity: number | null;
	unit: string | null;
};

export type Recipe = {
	id: number;
	name: string;
	description?: string | null;
	instructions?: string | null;
	servings?: number | null;
	tags?: string[];
	ingredients?: {
		id: number;
		name: string;
		pivot: {
			quantity: string | null;
			unit: string | null;
		};
	}[];
};

export type RecipeFormIngredientRow = {
	ingredientId: string;
	quantity: string;
	unit: string;
};

export type RecipeFormState = {
	id?: number;
	name: string;
	description: string;
	tagsText: string;
	ingredients: RecipeFormIngredientRow[];
};
