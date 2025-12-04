// src/lib/api.ts
import axios, { type AxiosRequestConfig } from "axios";

export const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:8000/api";

// instancia do axios
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// interceptor pra injetar token em TODAS as requisições
api.interceptors.request.use((config: any) => {
  const token = localStorage.getItem("auth_token");

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// helper genérico, parecido com o apiFetch que vc tinha
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
    // tenta extrair mensagem amigável da API
    const message =
      error?.response?.data?.message ??
      error?.message ??
      "Unexpected API error";

    throw new Error(message);
  }
}
