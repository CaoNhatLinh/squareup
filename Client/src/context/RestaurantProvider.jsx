import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { RestaurantContext } from './RestaurantContext';
import { fetchRestaurant } from '../api/restaurants';

export function RestaurantProvider({ children, initialRestaurantData }) {
  const [restaurant, setRestaurant] = useState(initialRestaurantData || null);
  const [loading, setLoading] = useState(false);
  const params = useParams();

  const restaurantId = params.restaurantId;

  useEffect(() => {
    const loadRestaurant = async () => {
      if (!restaurantId) {
        setRestaurant(null);
        setLoading(false);
        return;
      }

      const skipPaths = ['signin', 'signup', 'signout', 'admin', 'dashboard', 'restaurants', 'shop', 'track-order'];
      if (skipPaths.includes(restaurantId)) {
        setRestaurant(null);
        setLoading(false);
        return;
      }

      if (restaurant?.id === restaurantId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const data = await fetchRestaurant(restaurantId);
        setRestaurant(data);
      } catch (error) {
        console.error("❌ Error fetching restaurant:", error);
        setRestaurant(null);
      } finally {
        setLoading(false);
      }
    };

    loadRestaurant();
  }, [restaurantId, restaurant?.id]);

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
