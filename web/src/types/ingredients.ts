export type Ingredient = {
	id: number;
	name: string;
	default_unit: string | null;
	created_at?: string;
	updated_at?: string;
};

export type IngredientFormState = {
	id?: number;
	name: string;
	default_unit: string;
};
