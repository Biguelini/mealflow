import axios, { type AxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";

export const API_BASE_URL = "http://192.168.0.109:8000/api";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "Accept": "application/json",
  },
});

api.interceptors.request.use(async (config: any) => {
  const token = await SecureStore.getItemAsync("auth_token");

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

export async function getAuthToken(): Promise<string | null> {
  return await SecureStore.getItemAsync("auth_token");
}

export async function setAuthToken(token: string): Promise<void> {
  await SecureStore.setItemAsync("auth_token", token);
}

export async function removeAuthToken(): Promise<void> {
  await SecureStore.deleteItemAsync("auth_token");
}
