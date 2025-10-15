// hooks/api-client.ts

const BASE_URL = "http://localhost:3000/api" // hoặc import.meta.env.NEXT_PUBLIC_API_URL

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[API Error ${response.status}]:`, errorText)
    throw new Error(`[HTTP ${response.status}] ${errorText}`)
  }

  const data = await response.json()
  return data as T
}
