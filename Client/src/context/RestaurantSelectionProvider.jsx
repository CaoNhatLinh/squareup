import { useState, useEffect } from 'react';
import { RestaurantSelectionContext } from './RestaurantSelectionContext';

export default function RestaurantSelectionProvider({ children }) {
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    localStorage.getItem('selectedRestaurantId') || null
  );
  const [userRestaurants, setUserRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (selectedRestaurantId) {
      localStorage.setItem('selectedRestaurantId', selectedRestaurantId);
    } else {
      localStorage.removeItem('selectedRestaurantId');
    }
  }, [selectedRestaurantId]);

  const value = {
    selectedRestaurantId,
    setSelectedRestaurantId,
    userRestaurants,
    setUserRestaurants,
    loading,
    setLoading,
  };

  return (
    <RestaurantSelectionContext.Provider value={value}>
      {children}
    </RestaurantSelectionContext.Provider>
  );
}
