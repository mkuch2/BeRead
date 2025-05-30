import { useState, useEffect, type ReactNode } from "react";
import {
  type User,
  signInWithEmailAndPassword,
  signOut as signOutFirebase,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
} from "firebase/auth";
import auth from "./firebase";
import { AuthContext } from "./hooks/useAuthContext";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  //Update user on authentication success
  useEffect(() => {
    return onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
  }, []);

  function login(email: string, password: string) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signOut() {
    return signOutFirebase(auth);
  }

  function signUp(email: string, password: string) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function getUser() {
    return auth.currentUser || null;
  }

  function getToken() {
    return auth.currentUser?.getIdToken(true) || null;
  }

  function getFirebaseId() {
    try {
      const user = auth.currentUser;
      //Throw error if no user
      if (!user) {
        throw new Error("User not found");
      }
      return user.uid;
    } catch (e) {
      console.log("Error getting user id: ", e);
      throw e;
    }
  }

  const value = {
    currentUser,
    login,
    signOut,
    signUp,
    getUser,
    isLoading,
    getFirebaseId,
    getToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
}
