export type AuthContextType = {
  authSession: AuthSessionPayload | null;
  isLoading: boolean;
  login: (idTokenString: string | undefined) => void;
  logout: () => void;
};

export type AuthToken = {
  appToken: string;
  issuedAt: number;
};
export type UserProfile = {
  id: number;
  email: string;
  name: string;
  isAdmin: boolean;
};
export type AuthSessionPayload = {
  token: AuthToken;
  user: UserProfile;
  expiresAt: number;
};
