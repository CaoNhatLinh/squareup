import { createContext, useContext } from "react";

export const GuestUserContext = createContext(null);

export function useGuestUser() {
  const context = useContext(GuestUserContext);
  if (!context) {
    throw new Error("useGuestUser must be used within GuestUserProvider");
  }
  return context;
}
