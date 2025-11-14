import React, { useEffect, useState } from "react";
import { GuestUserContext } from "./GuestUserContext";
import { useParams } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';
import { cleanupOldGuestUserData } from "@/utils/guestUserCleanup";

const GUEST_UUID_PREFIX = "guest_uuid_";

export function GuestUserProvider({ children }) {
  const { restaurantId } = useParams();
  const [guestUuid, setGuestUuid] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cleanupOldGuestUserData();
    
    const initializeGuestUser = async () => {
      if (!restaurantId) {
        setLoading(false);
        return; 
      }

      try {
        const storageKey = `${GUEST_UUID_PREFIX}${restaurantId}`;
        const existingUuid = localStorage.getItem(storageKey);

        if (existingUuid) {
          setGuestUuid(existingUuid);
        } else {
          const newUuid = uuidv4();
          localStorage.setItem(storageKey, newUuid);
          setGuestUuid(newUuid);
        }
      } catch (error) {
        console.error("❌ Error initializing guest user:", error);
      } finally {
        setLoading(false);
      }
    };

    initializeGuestUser();
  }, [restaurantId]);

  const value = {
    guestUuid,
    loading,
  };

  return (
    <GuestUserContext.Provider value={value}>
      {children}
    </GuestUserContext.Provider>
  );
}
