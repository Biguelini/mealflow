import { useState, useCallback } from "react";

export interface UseFormDialogState {
	isOpen: boolean;
	isSaving: boolean;
	error: string | null;
}

export function useFormDialog<T>(initialData?: T) {
	const [state, setState] = useState<UseFormDialogState>({
		isOpen: false,
		isSaving: false,
		error: null,
	});
	const [editingItem, setEditingItem] = useState<T | undefined>(initialData);

	const open = useCallback((item?: T) => {
		setEditingItem(item);
		setState({
			isOpen: true,
			isSaving: false,
			error: null,
		});
	}, []);

	const close = useCallback(() => {
		setState({
			isOpen: false,
			isSaving: false,
			error: null,
		});
		setEditingItem(undefined);
	}, []);

	const setSaving = useCallback((saving: boolean) => {
		setState((prev) => ({ ...prev, isSaving: saving }));
	}, []);

	const setError = useCallback((error: string | null) => {
		setState((prev) => ({ ...prev, error }));
	}, []);

	return {
		...state,
		editingItem,
		open,
		close,
		setSaving,
		setError,
	};
}
