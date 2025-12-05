import { apiFetch } from "@/services/api";
import { useAuth } from "@/hooks/useAuth";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
	useMemo,
} from "react";

export type Household = {
	id: number;
	name: string;
	owner_id: number;
};

type HouseholdContextValue = {
	households: Household[];
	currentHousehold: Household | null;
	setCurrentHousehold: (household: Household) => void;
	loading: boolean;
	error: string | null;
	isOwner: boolean;
};

const HouseholdContext = createContext<HouseholdContextValue | undefined>(
	undefined
);

export function HouseholdProvider({ children }: { children: ReactNode }) {
	const { user } = useAuth();
	const [households, setHouseholds] = useState<Household[]>([]);
	const [currentHousehold, setCurrentHouseholdState] = useState<Household | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);


	const isOwner = useMemo(() => {
		if (!user || !currentHousehold) return false;
		return user.id === currentHousehold.owner_id;
	}, [user, currentHousehold]);


	useEffect(() => {
		async function loadHouseholds() {
			try {
				setLoading(true);
				setError(null);

				const data = await apiFetch<Household[]>("/households", {
					method: "GET",
				});

				setHouseholds(data);


				if (data.length > 0) {

					const savedHouseholdId = localStorage.getItem("current_household_id");
					const saved = data.find((h) => h.id === Number(savedHouseholdId));

					if (saved) {
						setCurrentHouseholdState(saved);
					} else {
						setCurrentHouseholdState(data[0]);
					}
				}
			} catch (err: any) {
				console.error("Failed to load households:", err);
				setError(err.message ?? "Erro ao carregar households.");
			} finally {
				setLoading(false);
			}
		}

		loadHouseholds();
	}, []);

	function setCurrentHousehold(household: Household) {
		setCurrentHouseholdState(household);
		localStorage.setItem("current_household_id", String(household.id));
	}

	return (
		<HouseholdContext.Provider
			value={{
				households,
				currentHousehold,
				setCurrentHousehold,
				loading,
				error,
				isOwner,
			}}
		>
			{children}
		</HouseholdContext.Provider>
	);
}

export function useHouseholdContext() {
	const ctx = useContext(HouseholdContext);
	if (!ctx) {
		throw new Error("useHouseholdContext must be used within HouseholdProvider");
	}
	return ctx;
}
