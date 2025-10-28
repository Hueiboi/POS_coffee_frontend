import { useState, useCallback } from "react";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);

  const login = useCallback((authData: { token: string; user?: any }) => {
    let user = authData.user
    if (!user) {
      try {
        const payload = JSON.parse(atob(authData.token.split(".")[1]))
        user = { id: payload.user_id, username: payload.username, role: payload.role }
      } catch {}
    }

    setIsAuthenticated(true)
    setUser(user)
    localStorage.setItem("token", authData.token)
    localStorage.setItem("user", JSON.stringify(user))
  }, [])


  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsAuthenticated(false);
    setUser(null);
    window.location.href = "/login";

  }, []);

  return { isAuthenticated, user, login, logout };
}
