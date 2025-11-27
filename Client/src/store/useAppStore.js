import { create } from "zustand";

export const useAppStore = create((set) => ({
  restaurantId: null,
  setRestaurantId: (id) => {
    set({ restaurantId: id });
  },
  restaurant: null,
  setRestaurant: (restaurant) => {
    set({ restaurant });
  },

  sidebarCollapsed: false,
  setSidebarCollapsed: (val) => set({ sidebarCollapsed: !!val }),
}));

export default useAppStore;
