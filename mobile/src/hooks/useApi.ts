import { useState, useCallback } from "react";
import { apiFetch } from "../services/api";

interface UseApiOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

export function useApi<T>(
  initialData: T | null = null,
  initialLoading = false
) {
  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(initialLoading);
  const [error, setError] = useState<string | null>(null);

  const fetch = useCallback(
    async (
      path: string,
      config: any = {},
      options: UseApiOptions<T> = {}
    ) => {
      setLoading(true);
      setError(null);

      try {
        const result = await apiFetch<T>(path, config);
        setData(result);
        options.onSuccess?.(result);
        return result;
      } catch (err: any) {
        const message = err.message || "Erro ao carregar dados";
        setError(message);
        options.onError?.(err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const reset = useCallback(() => {
    setData(initialData);
    setError(null);
    setLoading(false);
  }, [initialData]);

  return { data, loading, error, fetch, setData, reset };
}

interface UseListOptions<T> extends UseApiOptions<T[]> {
  searchDelay?: number;
}

export function useList<T>(
  initialData: T[] = [],
  loadFn: (search: string) => Promise<T[]>,
  options: UseListOptions<T> = {}
) {
  const [items, setItems] = useState<T[]>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const load = useCallback(
    async (searchTerm = "") => {
      setLoading(true);
      setError(null);

      try {
        const result = await loadFn(searchTerm);
        setItems(result);
        options.onSuccess?.(result);
      } catch (err: any) {
        const message = err.message || "Erro ao carregar lista";
        setError(message);
        options.onError?.(err);
      } finally {
        setLoading(false);
      }
    },
    [loadFn, options]
  );

  return { items, loading, error, search, setSearch, load, setItems };
}
