import React, { useEffect, useState } from "react";
import { auth } from "@/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "./AuthContext";
import * as authApi from "@/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const sessionData = await authApi.verifySession();
          setUser({
            ...firebaseUser,
            isAdmin: sessionData.isAdmin || false,
            role: sessionData.role || 'user'
          });
        } catch (error) {
          console.error('Session verification failed:', error);
          try {
            const idToken = await firebaseUser.getIdToken(true);
            await authApi.sessionLogin(idToken);
            const sessionData = await authApi.verifySession();
            setUser({
              ...firebaseUser,
              isAdmin: sessionData.isAdmin || false,
              role: sessionData.role || 'user'
            });
          } catch (retryError) {
            console.error('Session retry failed:', retryError);
            setUser({
              ...firebaseUser,
              isAdmin: false,
              role: 'user'
            });
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;
