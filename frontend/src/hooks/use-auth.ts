import { useState, useCallback, useEffect } from "react";
import { login as apiLogin, logoutApi, validateSession } from "@/lib/api";
import type { LoginResult } from "@/lib/api";

const TOKEN_KEY = "sessionToken";

export function useAuth() {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    validateSession(token)
      .then((result) => {
        if (!result.valid) {
          setToken(null);
          try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
        }
      })
      .catch(() => {
        setToken(null);
        try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<LoginResult> => {
    const result = await apiLogin(username, password);
    if (result.success && result.token) {
      setToken(result.token);
      try { localStorage.setItem(TOKEN_KEY, result.token); } catch { /* ignore */ }
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    if (token) {
      logoutApi(token).catch(() => { /* ignore */ });
    }
    setToken(null);
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* ignore */ }
  }, [token]);

  return {
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
  };
}
