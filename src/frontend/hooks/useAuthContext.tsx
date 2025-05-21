import { useContext, createContext } from "react";
import { type UserCredential, type User } from "firebase/auth";

export interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<UserCredential>;
  signOut: () => Promise<void>;
  signUp: (email: string, password: string) => Promise<UserCredential>;
  getUser: () => User | null;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuthContext() {
  const context = useContext(AuthContext);
  return context;
}
