import { useEffect, useState } from "react";
import { auth } from "@/firebase"; 
import { onAuthStateChanged } from "firebase/auth";
import { AuthContext } from "@/context/AuthContext";
import * as authApi from "@/api/auth";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken(true);
          await authApi.sessionLogin(idToken);
          const sessionRaw = await authApi.verifySession();
          const sessionData = sessionRaw && sessionRaw.data !== undefined ? sessionRaw.data : sessionRaw;
          const normalized = {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            
            isAdmin: sessionData.isAdmin || false,
            admin: !!sessionData.isAdmin,
            role: sessionData.role || 'user',
            restaurantId: sessionData.restaurantId || null,
            permissions: sessionData.permissions || {},
            customClaims: sessionRaw || sessionData || {},
          };
          setUser({ ...firebaseUser, ...normalized });
        } catch (error) {
          console.error('Session creation failed:', error);
          
          try {
            await authApi.sessionLogout();
          } catch {
            
          }
          const normalized = {
            uid: firebaseUser?.uid,
            email: firebaseUser?.email,
            isAdmin: false,
            admin: false,
            role: 'user',
            restaurantId: null,
            permissions: {},
            customClaims: {},
          };
          setUser({ ...firebaseUser, ...normalized });
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
