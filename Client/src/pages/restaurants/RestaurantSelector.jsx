import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HiPlus,
  HiOutlineArrowRight,
  HiOutlineBuildingOffice,
  HiBuildingStorefront,
} from "react-icons/hi2";
import { IoRestaurantSharp } from "react-icons/io5";
import { useRestaurantSelection } from "@/hooks/useRestaurantSelection";
import { getUserRestaurants, createRestaurant } from "@/api/restaurants";
import { useToast } from "@/hooks/useToast";
import { useAuth } from "@/hooks/useAuth"; 

export default function RestaurantSelector() {
  const navigate = useNavigate();
  const {
    setSelectedRestaurantId,
    userRestaurants,
    setUserRestaurants,
    setLoading,
    loading: selectionLoading,
  } = useRestaurantSelection();
  const { user, loading: authLoading } = useAuth();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newRestaurantName, setNewRestaurantName] = useState("");
  const [newRestaurantDescription, setNewRestaurantDescription] = useState("");
    const { success, error } = useToast();

  const fetchUserRestaurants = async () => {
    try {
      setLoading(true);
      
      // If user is staff, redirect directly to their restaurant
      if (user?.role === 'staff' && user?.restaurantId) {
        setSelectedRestaurantId(user.restaurantId);
        navigate(`/${user.restaurantId}/dashboard`, { replace: true });
        return;
      }
      
      const restaurants = await getUserRestaurants();
      setUserRestaurants(restaurants); 
    } catch (error) {
      console.error("Error fetching restaurants:", error);
      error("Failed to load restaurants", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      // If user is staff, redirect directly to their restaurant
      if (user.role === 'staff' && user.restaurantId) {
        setSelectedRestaurantId(user.restaurantId);
        navigate(`/${user.restaurantId}/dashboard`, { replace: true });
        return;
      }
      fetchUserRestaurants();
    } else if (!authLoading && !user) {
      // Only redirect to signin if auth is done loading and still no user
      navigate("/signin", { replace: true });
    } // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading]);

  const handleSelectRestaurant = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    navigate(`/${restaurantId}/dashboard`);
  };

  const handleCreateRestaurant = async (e) => {
    e.preventDefault();
    if (!newRestaurantName.trim()) {
      error("Please enter a restaurant name", "error");
      return;
    }

    try {
      setCreating(true);
      const newRestaurant = await createRestaurant({ name: newRestaurantName , description: newRestaurantDescription });
      success(`Restaurant "${newRestaurant.name}" created!`); 
      setSelectedRestaurantId(newRestaurant.id);
      navigate(`/${newRestaurant.id}/dashboard`);
    } catch (error) {
      console.error("Error creating restaurant:", error);
      error("Failed to create restaurant", "error");
    } finally {
      setCreating(false);
      setShowCreateModal(false);
      setNewRestaurantName("");
    }
  }; 
  if (authLoading || selectionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="loader ease-linear rounded-full border-4 border-t-4 border-gray-300 h-12 w-12 mb-4 mx-auto animate-spin"></div>

          <h2 className="text-xl font-semibold text-gray-700">
            Loading Restaurants...
          </h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-16">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-3 flex items-center justify-center gap-3">
            <IoRestaurantSharp className="w-10 h-10 text-gray-900" />
            Your Restaurants 
          </h1>

          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Select a restaurant to manage its operations or launch a new
            venture.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {userRestaurants.map((restaurant) => (
            <div
              key={restaurant.id}
              className="relative flex flex-col bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 text-left group border border-gray-200 hover:border-gray-400 transform hover:scale-[1.02]"
            >
              <button
                onClick={() => handleSelectRestaurant(restaurant.id)}
                className="flex-1 text-left"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div
                    className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      restaurant.logo ? "p-0 overflow-hidden" : "bg-gray-100"
                    }`}
                  >
                    {restaurant.logo ? (
                      <img
                        src={restaurant.logo}
                        alt={restaurant.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <HiBuildingStorefront className="w-6 h-6 text-gray-500" />
                    )}
                  </div>
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs font-semibold rounded-full">
                    {restaurant.role || "Owner"}
                  </span>
                </div>
                <div className="mt-2">
                  <h3 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-gray-700 transition-colors truncate">
                    {restaurant.name}
                  </h3>

                  {restaurant.description && (
                    <p className="text-sm text-gray-500 line-clamp-2 min-h-[2.5rem]">
                      {restaurant.description}
                    </p>
                  )}
                </div>
              </button>
              
              <div className="absolute bottom-4 right-4 p-2 bg-gray-100 rounded-full group-hover:bg-gray-200 transition-all duration-300">
                <HiOutlineArrowRight className="w-5 h-5 text-gray-500 group-hover:text-gray-700" />
              </div>
            </div>
          ))}
          <button
            onClick={() => setShowCreateModal(true)}
            className="bg-white border-2 border-dashed border-gray-300 p-6 rounded-2xl transition-all duration-200 text-gray-700 group hover:border-gray-500 hover:bg-gray-50"
          >
            <div className="flex flex-col items-center justify-center h-full min-h-[200px]">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-sm group-hover:bg-gray-200 transition-colors">
                <HiPlus className="w-8 h-8 text-gray-500" />
              </div>

              <h3 className="text-xl font-bold mb-1 text-gray-700">
                Create New
              </h3>

              <p className="text-sm text-gray-500">
                Add a new management location
              </p>
            </div>
          </button>
        </div>
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 border border-gray-200 animate-in fade-in zoom-in-95 duration-300">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <HiOutlineBuildingOffice className="w-6 h-6 text-gray-600" />
                New Restaurant Setup
              </h2>

              <form onSubmit={handleCreateRestaurant}>
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What's the name of your new restaurant? *
                  </label>

                  <input
                    type="text"
                    value={newRestaurantName}
                    onChange={(e) => setNewRestaurantName(e.target.value)}
                    placeholder="E.g., The Cozy Kitchen"
                    className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-xl focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none transition-colors"
                    autoFocus
                    required
                  />
                </div>
                <div className="mb-8">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    What description of restaurant is it? *
                  </label>
                  <input
                    type="text"
                    value={newRestaurantDescription}
                    onChange={(e) => setNewRestaurantDescription(e.target.value)}
                    placeholder="e.g., serving chicken dishes"
                    className="w-full px-4 py-3 bg-gray-50 text-gray-900 border border-gray-300 rounded-xl focus:border-gray-500 focus:ring-1 focus:ring-gray-300 focus:outline-none transition-colors"
                    required
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewRestaurantName("");
                    }}
                    className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-colors"
                    disabled={creating}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    disabled={creating}
                  >
                    {creating ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 text-white"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      "Create & Go to Dashboard"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
