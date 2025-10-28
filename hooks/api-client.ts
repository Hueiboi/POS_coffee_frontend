// hooks/api-client.ts
// hooks/api-client.ts
const BASE_URL = "http://localhost:3000/api";

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  // Lấy token trực tiếp từ localStorage mỗi khi gọi API
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;

  // Merge headers an toàn
  const defaultHeaders: Record<string, string> = {
    "Content-Type": "application/json",
  };

  const givenHeaders = (options.headers || {}) as Record<string, string>;
  const headers = {
    ...defaultHeaders,
    ...givenHeaders,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  // Token hết hạn → thử refresh (server trả 401 hoặc 403 tùy impl)
  if (response.status === 401 || response.status === 403) {
    const refresh = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null;
    if (refresh) {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refresh }),
      });

      if (refreshRes.ok) {
        const newData = await refreshRes.json();
        const newToken = newData?.data?.access_token;
        if (newToken) {
          localStorage.setItem("token", newToken);
          // Gọi lại API vừa bị lỗi bằng token mới
          return apiRequest<T>(endpoint, options);
        }
      } else {
        console.warn("Refresh token expired, clearing tokens.");
        localStorage.removeItem("token");
        localStorage.removeItem("refresh_token");
        throw new Error("Session expired");
      }
    } else {
      // Không có refresh token
      localStorage.removeItem("token");
      throw new Error("Unauthorized");
    }
  }

  // Nếu lỗi khác
  if (!response.ok) {
    const errorText = await response.text();
    console.error(`[API Error ${response.status}]:`, errorText);
    throw new Error(`[HTTP ${response.status}] ${errorText}`);
  }

  // Trả về JSON
  const data = await response.json();
  return data as T;
}

