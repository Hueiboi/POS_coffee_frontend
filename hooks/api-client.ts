// hooks/api-client.ts

const BASE_URL = "http://localhost:3000/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Lấy token trực tiếp từ localStorage mỗi khi gọi API
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  });

  // Token hết hạn → thử refresh
  if (response.status === 403) {
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

        // Gọi lại API vừa bị lỗi bằng token mới
        return apiRequest<T>(endpoint, options);
      } else {
        console.warn("Refresh token expired, logging out...");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        throw new Error("Session expired");
      }
    }
  }

  // Nếu lỗi khác
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API Error ${response.status}]:`, errorText);
    throw new Error(`[HTTP ${response.status}] ${errorText}`);
  }

  // ✅ Trả về JSON
  const data = await response.json();
  return data as T;
}
