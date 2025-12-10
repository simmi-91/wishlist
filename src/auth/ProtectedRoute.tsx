import { type ReactNode } from "react";
import { useAuth } from "./authContext";

import Loading from "../features/Loading";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { authSession, isLoading } = useAuth();

  if (isLoading) return <Loading />;
  if (!authSession) return <div>not authenticated...</div>;
  return children;
}
