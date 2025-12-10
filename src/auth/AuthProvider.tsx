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

  const handleLogin = async (idTokenString: string | undefined) => {
    try {
      setIsLoading(true);
      const response = await fetch(
        import.meta.env.VITE_API_BASE_URL + "/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token: idTokenString }),
        }
      );

      const data = await response.json();
      if (response.ok) {
        const { token: appToken, user, expiresAt } = data;
        const payloadToSend = {
          token: {
            appToken: appToken,
            issuedAt: Date.now(),
          },
          user,
          expiresAt,
        };
        setAuthSession(payloadToSend);
      } else {
        console.error("Backend Auth Error:", data.error);
      }
    } catch (error) {
      console.error("Network or Fetch Error:", error);
    } finally {
      setIsLoading(false);
    }
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
    login: handleLogin,
    logout: handleLogout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
