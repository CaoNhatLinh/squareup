import { create } from "zustand";

export const useAppStore = create((set) => ({
  restaurantId: typeof window !== 'undefined' ? (localStorage.getItem('restaurantId') || null) : null,
  setRestaurantId: (id) => {
    try {
      if (typeof window !== 'undefined') {
        if (id) localStorage.setItem('restaurantId', id);
        else localStorage.removeItem('restaurantId');
      }
    } catch (error) { void error; }
    set({ restaurantId: id });
  },
  
  sidebarCollapsed: false,
  setSidebarCollapsed: (val) => set({ sidebarCollapsed: !!val }),
}));

export default useAppStore;
