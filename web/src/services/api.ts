const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

export async function apiGet(path: string) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Erro na requisição: ${response.status}`);
  }

  return response.json();
}
