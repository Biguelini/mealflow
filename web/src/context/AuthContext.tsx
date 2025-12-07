import { apiFetch } from "@/services/api";
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

type User = {
	id: number;
	name: string;
	email: string;
};

type AuthContextValue = {
	user: User | null;
	loading: boolean;
	login: (email: string, password: string) => Promise<void>;
	register: (name: string, email: string, password: string) => Promise<void>;
	logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
	const [user, setUser] = useState<User | null>(null);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const token = localStorage.getItem("auth_token");
		if (!token) {
			setLoading(false);
			return;
		}

		apiFetch<User>("/auth/me")
			.then((me) => {
				setUser(me);
			})
			.catch(() => {
				localStorage.removeItem("auth_token");
				setUser(null);
			})
			.finally(() => setLoading(false));
	}, []);

	async function login(email: string, password: string) {
		const data = await apiFetch<{ user: User; token: string }>("/auth/login", {
			method: "POST",
			data: JSON.stringify({ email, password }),
		});

		localStorage.setItem("auth_token", data.token);

		setUser(data.user);
	}

	async function register(name: string, email: string, password: string) {
		const data = await apiFetch<{ user: User; token: string }>(
			"/auth/register",
			{
				method: "POST",
				data: JSON.stringify({ name, email, password }),
			}
		);

		localStorage.setItem("auth_token", data.token);

		setUser(data.user);
	}

	function logout() {
		localStorage.removeItem("auth_token");

		setUser(null);
	}

	return (
		<AuthContext.Provider
			value={{
				user,
				loading,
				login,
				register,
				logout,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuthContext() {
	const ctx = useContext(AuthContext);

	if (!ctx) {
		throw new Error("useAuthContext must be used within AuthProvider");
	}

	return ctx;
}
