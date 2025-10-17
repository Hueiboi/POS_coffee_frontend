// hooks/api-client.ts

const BASE_URL = "http://localhost:3000/api" // hoặc import.meta.env.NEXT_PUBLIC_API_URL

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  })

  // Nếu token hết hạn
  if (response.status === 403 || response.status === 401) {
    const refresh = localStorage.getItem("refresh_token");
    if (refresh) {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });
      if (refreshRes.ok) {
        const newData = await refreshRes.json();
        const newToken = newData.data.access_token;
        localStorage.setItem("token", newToken);
        // Gọi lại API vừa bị lỗi
        return apiRequest<T>(endpoint, options, newToken);
      } else {
        console.warn("Refresh token expired, logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/";
      }
    }
  }

  if (!response.ok) {
    const errorText = await response.text()
    console.error(`[API Error ${response.status}]:`, errorText)
    throw new Error(`[HTTP ${response.status}] ${errorText}`)
  }

  const data = await response.json()
  return data as T
}
