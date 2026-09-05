import { createContext, useContext, useEffect, useState } from "react";
import { auth as authApi } from "@/lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("sojaru_token");
    if (!token) { setReady(true); return; }
    authApi.me()
      .then(setUser)
      .catch(() => localStorage.removeItem("sojaru_token"))
      .finally(() => setReady(true));
  }, []);

  const login = async (payload) => {
    const data = await authApi.login(payload);
    localStorage.setItem("sojaru_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const register = async (payload) => {
    const data = await authApi.register(payload);
    localStorage.setItem("sojaru_token", data.token);
    setUser(data.user);
    return data.user;
  };
  const logout = () => {
    localStorage.removeItem("sojaru_token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
