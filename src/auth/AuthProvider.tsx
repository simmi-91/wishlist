import { useEffect, useState, type ReactNode } from "react";
import { googleLogout } from "@react-oauth/google";

import { AuthContext } from "./authContext";
import type { AuthSessionPayload } from "../types/auth";

const STORAGE_NAME = "wishlist_auth_session";

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authSession, setAuthSession] = useState<AuthSessionPayload | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const handleLogin = (payload: AuthSessionPayload) => {
    setAuthSession(payload);
  };

  const handleLogout = () => {
    googleLogout();
    setAuthSession(null);
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const storedAuthSession = localStorage.getItem(STORAGE_NAME);
      if (storedAuthSession) {
        const storedSessionJson = JSON.parse(storedAuthSession);

        const expirationTime = storedSessionJson.expiresAt;
        const now = Date.now();
        if (now < expirationTime) {
          setAuthSession(storedSessionJson);
        } else {
          setAuthSession(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  useEffect(() => {
    if (authSession) {
      localStorage.setItem(STORAGE_NAME, JSON.stringify(authSession));
    } else {
      localStorage.removeItem(STORAGE_NAME);
    }
  }, [authSession]);

  const contextValue = {
    authSession,
    isLoading,
    setIsLoading,
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
