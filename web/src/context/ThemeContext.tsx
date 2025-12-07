import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | null>(null);

function getSystemTheme(): "light" | "dark" {
	if (typeof window === "undefined") return "light";
	return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
	const [theme, setThemeState] = useState<Theme>(() => {
		if (typeof window === "undefined") return "system";
		return (localStorage.getItem("theme") as Theme) || "system";
	});

	const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => {
		if (theme === "system") return getSystemTheme();
		return theme;
	});

	useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove("light", "dark");

		let actualTheme: "light" | "dark";
		if (theme === "system") {
			actualTheme = getSystemTheme();
		} else {
			actualTheme = theme;
		}

		root.classList.add(actualTheme);
		setResolvedTheme(actualTheme);
	}, [theme]);

	useEffect(() => {
		if (theme !== "system") return;

		const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

		const handleChange = () => {
			const root = window.document.documentElement;
			root.classList.remove("light", "dark");
			const newTheme = getSystemTheme();
			root.classList.add(newTheme);
			setResolvedTheme(newTheme);
		};

		mediaQuery.addEventListener("change", handleChange);

		return () => mediaQuery.removeEventListener("change", handleChange);
	}, [theme]);

	function setTheme(newTheme: Theme) {
		localStorage.setItem("theme", newTheme);
		setThemeState(newTheme);
	}

	return (
		<ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const context = useContext(ThemeContext);

	if (!context) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}

	return context;
}
