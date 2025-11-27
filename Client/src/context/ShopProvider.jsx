import { useCallback, useEffect, useState } from "react";
import { ShopContext } from "@/context/ShopContext";
import { useDiscountCalculation } from "@/hooks/useDiscountCalculation";

const CART_STORAGE_KEY = "shop_cart";

export function ShopProvider({ children }) {
  const [restaurant, setRestaurant] = useState(null);
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState({});
  const [modifiers, setModifiers] = useState({});
  const [activeDiscounts, setActiveDiscounts] = useState({});
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      return savedCart ? JSON.parse(savedCart) : [];
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (error) {
      console.error("Error saving cart to localStorage:", error);
    }
  }, [cart]);

  useEffect(() => {
    if (Object.keys(items).length === 0 && Object.keys(modifiers).length === 0)
      return;

    setCart((prevCart) => {
      const validCart = prevCart.filter((cartItem) => {
        if (cartItem.id.startsWith("sample-")) return true;

        const item = items[cartItem.itemId];

        if (!item) {
          console.warn(
            `Removing item ${cartItem.name} from cart because it no longer exists.`
          );
          return false;
        }

        if (cartItem.selectedOptions && cartItem.selectedOptions.length > 0) {
          const allModifiersValid = cartItem.selectedOptions.every((option) => {
            const modifier = modifiers[option.modifierId];
            if (!modifier) {
              console.warn(
                `Removing item ${cartItem.name} because modifier group ${option.modifierId} is missing.`
              );
              return false;
            }

            if (!modifier.options || !modifier.options[option.id]) {
              console.warn(
                `Removing item ${cartItem.name} because modifier option ${option.name} is missing.`
              );
              return false;
            }
            return true;
          });

          if (!allModifiersValid) return false;
        }

        return true;
      });

      if (validCart.length !== prevCart.length) {
        return validCart;
      }
      return prevCart;
    });
  }, [items, modifiers]);

  const getCartItemGroupKey = useCallback((itemId, selectedOptions) => {
    const sortedOptions = [...selectedOptions].sort((a, b) =>
      a.id.localeCompare(b.id)
    );
    const optionsKey = sortedOptions.map((opt) => opt.id).join(",");
    return `${itemId}_${optionsKey}`;
  }, []);

  const addToCart = useCallback(
    (
      item,
      selectedOptions = [],
      quantity = 1,
      specialInstruction = "",
      editingCartKey = null
    ) => {
      const groupKey = getCartItemGroupKey(item.id, selectedOptions);
      const basePrice = item.price || 0;
      const optionsPrice = selectedOptions.reduce(
        (sum, opt) => sum + (opt.price || 0),
        0
      );
      const pricePerItem = basePrice + optionsPrice;

      let categoryId = null;
      for (const category of categories) {
        if (category.itemIds && category.itemIds.includes(item.id)) {
          categoryId = category.id;
          break;
        }
      }

      setCart((prevCart) => {
        let cartWithoutEditing = prevCart;
        if (editingCartKey) {
          cartWithoutEditing = prevCart.filter(
            (cartItem) => cartItem.groupKey !== editingCartKey
          );
        }

        const existingItemIndex = cartWithoutEditing.findIndex(
          (cartItem) => cartItem.groupKey === groupKey
        );

        if (existingItemIndex >= 0) {
          return cartWithoutEditing.map((cartItem, index) => {
            if (index === existingItemIndex) {
              return {
                ...cartItem,
                quantity: cartItem.quantity + quantity,
                totalPrice: cartItem.totalPrice + pricePerItem * quantity,
                specialInstruction:
                  specialInstruction || cartItem.specialInstruction,
              };
            }
            return cartItem;
          });
        } else {
          const cartItem = {
            id: `${item.id}_${Date.now()}`,
            groupKey: groupKey,
            itemId: item.id,
            categoryId: categoryId,
            name: item.name,
            price: pricePerItem,
            image: item.image,
            discount: item.discount,
            selectedOptions: selectedOptions,
            quantity: quantity,
            totalPrice: pricePerItem * quantity,
            specialInstruction: specialInstruction,
          };
          return [...cartWithoutEditing, cartItem];
        }
      });
    },
    [getCartItemGroupKey, categories]
  );

  const removeFromCart = useCallback((groupKey) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.groupKey !== groupKey)
    );
  }, []);

  const updateCartItemQuantity = useCallback(
    (groupKey, newQuantity) => {
      if (newQuantity <= 0) {
        removeFromCart(groupKey);
        return;
      }
      setCart((prevCart) =>
        prevCart.map((item) => {
          if (item.groupKey === groupKey) {
            return {
              ...item,
              quantity: newQuantity,
              totalPrice: item.price * newQuantity,
            };
          }
          return item;
        })
      );
    },
    [removeFromCart]
  );

  const clearCart = useCallback(() => {
    setCart([]);
    localStorage.removeItem(CART_STORAGE_KEY);
  }, []);

  const getCartTotal = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.totalPrice, 0);
  }, [cart]);

  const getTotalItemsCount = useCallback(() => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  }, [cart]);

  const discountCalculation = useDiscountCalculation(cart, activeDiscounts);

  const value = {
    restaurant,
    categories,
    items,
    modifiers,
    cart,
    activeDiscounts,
    discountCalculation,

    setRestaurant,
    setCategories,
    setItems,
    setModifiers,
    setActiveDiscounts,

    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    getCartTotal,
    getTotalItemsCount,
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
