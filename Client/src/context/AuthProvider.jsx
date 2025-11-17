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
        // Always create fresh session with force-refreshed token to get latest custom claims
        try {
          // Force refresh to get latest custom claims (role, restaurantId, etc.)
          const idToken = await firebaseUser.getIdToken(true);
          await authApi.sessionLogin(idToken);
          const sessionRaw = await authApi.verifySession();
          const sessionData = sessionRaw && sessionRaw.data !== undefined ? sessionRaw.data : sessionRaw;
          setUser({
            ...firebaseUser,
            isAdmin: sessionData.isAdmin || false,
            role: sessionData.role || 'user',
            restaurantId: sessionData.restaurantId || null,
            permissions: sessionData.permissions || {}
          });
        } catch (error) {
          console.error('Session creation failed:', error);
          // Clear any stale cookies and set fallback user
          try {
            await authApi.sessionLogout();
          } catch (logoutErr) {
            // ignore
          }
          setUser({
            ...firebaseUser,
            isAdmin: false,
            role: 'user',
            restaurantId: null,
            permissions: {}
          });
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
