export type MealType = {
	id: number;
	household_id: number;
	name: string;
	order: number;
	created_at: string;
	updated_at: string;
};

export type MealTypeFormState = {
	id?: number;
	name: string;
	order?: number;
};
