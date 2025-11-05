import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { fetchRestaurant } from '../api/restaurants';
import { RestaurantContext } from './RestaurantContext';

export function RestaurantProvider({ children }) {
  const { user } = useAuth();
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) {
      setRestaurant(null);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchRestaurant(user.uid)
      .then((data) => setRestaurant(data))
      .catch((err) => {
        console.error('Failed to load restaurant:', err);
        setRestaurant(null);
      })
      .finally(() => setLoading(false));
  }, [user?.uid]);

  useEffect(() => {
    const handleUpdate = (event) => {
      if (event.detail) {
        setRestaurant((prev) => ({ ...prev, ...event.detail }));
      }
    };
    window.addEventListener('restaurantUpdated', handleUpdate);
    return () => window.removeEventListener('restaurantUpdated', handleUpdate);
  }, []);

  const updateRestaurant = (updates) => {
    setRestaurant((prev) => ({ ...prev, ...updates }));
    window.dispatchEvent(new CustomEvent('restaurantUpdated', { detail: updates }));
  };

  return (
    <RestaurantContext.Provider value={{ restaurant, loading, updateRestaurant }}>
      {children}
    </RestaurantContext.Provider>
  );
}
