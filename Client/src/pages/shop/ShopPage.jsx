import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { fetchRestaurantForShop } from "../../api/restaurants";
import { fetchActiveDiscounts } from "../../api/discounts";
import { ShopProvider} from "../../context/ShopProvider";
import { useShop } from "../../context/ShopContext";
import ShopHeader from "./components/ShopHeader";
import RestaurantBanner from "./components/RestaurantBanner";
import RestaurantInfoDrawer from "./components/RestaurantInfoDrawer";
import ClosedBanner from "./components/ClosedBanner";
import CategoryNavigation from "./components/CategoryNavigation";
import ItemList from "./components/ItemList";
import ModifierModal from "./components/ModifierModal";
import CartDrawer from "./components/CartDrawer";
import PromotionsDrawer from "./components/PromotionsDrawer";
import Footer from "./components/Footer";

function ShopPageContent() {
  const { restaurantId } = useParams();
  const {
    restaurant,
    setRestaurant,
    categories,
    setCategories,
    items,
    setItems,
    modifiers,
    setModifiers,
    activeDiscounts,
    setActiveDiscounts,
    addToCart,
  } = useShop();

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isPromotionsOpen, setIsPromotionsOpen] = useState(false);
  const [isInfoDrawerOpen, setIsInfoDrawerOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      const categoryElements = categories.map((cat) => ({
        id: cat.id,
        element: document.getElementById(`category-${cat.id}`),
      }));
      const scrollPosition = window.scrollY + 200; 
      for (let i = categoryElements.length - 1; i >= 0; i--) {
        const { id, element } = categoryElements[i];
        if (element && element.offsetTop <= scrollPosition) {
          setSelectedCategory(id);
          return;
        }
      }
      if (window.scrollY < 100) {
        setSelectedCategory("all");
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [categories]);

  useEffect(() => {
    if (!restaurantId) {
      console.warn("⚠️ restaurantId is missing from URL params");
      setError("Restaurant ID không hợp lệ");
      setLoading(false);
      return;
    }

    const fetchRestaurantData = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchRestaurantForShop(restaurantId);

        setRestaurant({ 
          name: data.name, 
          description: data.description,
          id: data.id,
          isOpen: data.isOpen,
          nextOpenTime: data.nextOpenTime,
          closureReason: data.closureReason, 
          hours: data.hours,
          address: data.address,
          phone: data.phone,
          email: data.email,
          website: data.website,
          logo: data.logo,
          coverImage: data.coverImage,
          featuredImage: data.featuredImage,
          socialMedia: data.socialMedia,
          specialClosures: data.specialClosures,
          active: data.active
        });
        const cats = data.categories ? Object.values(data.categories) : [];
        setCategories(cats);
        setItems(data.items || {});
        setModifiers(data.modifiers || {});

        try {
          const discounts = await fetchActiveDiscounts(restaurantId);
          setActiveDiscounts(discounts);
        } catch (error) {
          console.error('❌ Failed to load discounts:', error);
        }
      } catch (error) {
        console.error("Failed to load restaurant data:", error);
        setError("Không thể tải dữ liệu nhà hàng. Vui lòng thử lại sau.");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantData();
  }, [restaurantId, setRestaurant, setCategories, setItems, setModifiers, setActiveDiscounts]);

  const handleAddToCart = (item, selectedOptions = [], quantity = 1, specialInstruction = "", editingCartKey = null) => {
    addToCart(item, selectedOptions, quantity, specialInstruction, editingCartKey);
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleItemClick = (item) => {
    if (restaurant.active === false) {
      return; // Don't allow ordering when restaurant is inactive
    }
    
    if (item.modifierIds && item.modifierIds.length > 0) {
      setSelectedItem(item);
      setIsModalOpen(true);
    } else {
      handleAddToCart(item, [], 1);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Đang tải...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">{error}</div>
      </div>
    );
  }

  if (!restaurant) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-red-600">No restaurant found</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <ShopHeader 
        onCartClick={() => setIsCartOpen(true)}
        onPromotionsClick={() => setIsPromotionsOpen(true)}
        hasActiveDiscounts={Object.keys(activeDiscounts).length > 0}
        isRestaurantActive={restaurant.active}
      />
      
      {/* Inactive Restaurant Banner */}
      {restaurant.active === false && (
        <div className="bg-red-600 text-white text-center py-4 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold mb-2">🏪 Restaurant Temporarily Closed</h2>
            <p className="text-sm opacity-90">
              This restaurant is currently inactive. Please check back later or contact the restaurant for more information.
            </p>
          </div>
        </div>
      )}
      
      {/* Restaurant Banner */}
      <RestaurantBanner 
        restaurant={restaurant}
        onInfoClick={() => setIsInfoDrawerOpen(true)}
        onPromotionsClick={() => setIsPromotionsOpen(true)}
        activeDiscounts={activeDiscounts}
      />

      <RestaurantInfoDrawer
        isOpen={isInfoDrawerOpen}
        onClose={() => setIsInfoDrawerOpen(false)}
        restaurant={restaurant}
      />

      <ClosedBanner restaurant={restaurant} />

      <CategoryNavigation
        categories={categories}
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />
      <div className="bg-gray-50">
        <ItemList
          categories={categories}
          items={items}
          onItemClick={handleItemClick}
        />
      </div>
      
      <Footer restaurant={restaurant} />

      {isModalOpen && selectedItem && (
        <ModifierModal
          item={selectedItem}
          modifiers={modifiers}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedItem(null);
          }}
          onAddToCart={handleAddToCart}
        />
      )}

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onEditItem={(cartItem) => {
          const originalItem = items[cartItem.itemId];
          if (originalItem) {
            setIsCartOpen(false);
            setSelectedItem({
              ...originalItem,
              preSelectedOptions: cartItem.selectedOptions,
              editingCartKey: cartItem.groupKey,
              editingQuantity: cartItem.quantity,
              specialInstruction: cartItem.specialInstruction,
            });
            setIsModalOpen(true);
          }
        }}
      />

      <PromotionsDrawer
        isOpen={isPromotionsOpen}
        onClose={() => setIsPromotionsOpen(false)}
        restaurantId={restaurantId}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <ShopProvider>
      <ShopPageContent />
    </ShopProvider>
  );
}
