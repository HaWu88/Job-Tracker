import { createContext, useContext, useEffect, useState } from "react";
import api from "../services/api";

const parseJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const savedAccess = localStorage.getItem("access_token");
    const savedRefresh = localStorage.getItem("refresh_token");
    if (savedAccess && savedRefresh) {
      setAccessToken(savedAccess);
      setRefreshToken(savedRefresh);
      api.defaults.headers["Authorization"] = `Bearer ${savedAccess}`;
      setUser(parseJwt(savedAccess));
    }
    setLoading(false);
  }, []);




  const login = (access, refresh) => {
    localStorage.setItem("access_token", access);
    localStorage.setItem("refresh_token", refresh);
    setAccessToken(access);
    setRefreshToken(refresh);
    api.defaults.headers["Authorization"] = `Bearer ${access}`;
    setUser(parseJwt(access));
  };

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setAccessToken(null);
    setRefreshToken(null);
    setUser(null);
  };



  return (
    <AuthContext.Provider
      value={{
        accessToken,
        refreshToken,
        user,
        login,
        logout,
        isAuthenticated: !!accessToken,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
