import axios, { type AxiosRequestConfig } from "axios";

export const API_BASE_URL =
	import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

export const api = axios.create({
	baseURL: API_BASE_URL,
	headers: {
		"Content-Type": "application/json",
	},
});

api.interceptors.request.use((config: any) => {
	const token = localStorage.getItem("auth_token");

	if (token) {
		config.headers = config.headers ?? {};
		config.headers.Authorization = `Bearer ${token}`;
	}

	return config;
});

export async function apiFetch<T>(
	path: string,
	config: AxiosRequestConfig = {}
): Promise<T> {
	try {
		const response = await api.request<T>({
			url: path,
			...config,
		});

		return response.data;
	} catch (error: any) {
		const message =
			error?.response?.data?.message ??
			error?.message ??
			"Unexpected API error";

		throw new Error(message);
	}
}
