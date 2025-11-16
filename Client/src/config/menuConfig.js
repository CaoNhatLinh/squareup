import {
  HiHome,
  HiShoppingBag,
  HiCreditCard,
  HiCog,
  HiUserGroup,
} from "react-icons/hi";

export const getMenuItems = (restaurantId, permissions = {}, userRole = 'user') => {
  const menuItems = [];

  // Helper function to check if user has any permission for a resource
  const hasAnyPermission = (resource) => {
    if (!permissions[resource]) return false;
    return Object.values(permissions[resource]).some(perm => perm === true);
  };

  // Check if user is owner (not staff)
  const isOwner = userRole !== 'staff';

  // Home - Always visible
  menuItems.push({ to: `/${restaurantId}/dashboard`, label: "Home", icon: HiHome });

  // Items & services section
  const itemsChildren = [];
  if (hasAnyPermission('items')) {
    itemsChildren.push({ to: `/${restaurantId}/items`, label: "Item library" });
  }
  if (hasAnyPermission('categories')) {
    itemsChildren.push({ to: `/${restaurantId}/categories`, label: "Categories" });
  }
  if (hasAnyPermission('modifiers')) {
    itemsChildren.push({ to: `/${restaurantId}/modifiers`, label: "Modifiers" });
  }
  if (hasAnyPermission('discounts')) {
    itemsChildren.push({ to: `/${restaurantId}/discounts`, label: "Discounts" });
  }

  if (itemsChildren.length > 0) {
    menuItems.push({
      label: "Items & services",
      icon: HiShoppingBag,
      children: itemsChildren,
    });
  }

  // Payments & invoices section
  const paymentsChildren = [];
  const ordersSubChildren = [];
  
  if (hasAnyPermission('orders')) {
    ordersSubChildren.push({ to: `/${restaurantId}/orders`, label: "All orders", badge: true });
  }
  if (hasAnyPermission('reviews')) {
    ordersSubChildren.push({ to: `/${restaurantId}/reviews`, label: "Reviews" });
  }
  
  if (ordersSubChildren.length > 0) {
    paymentsChildren.push({
      label: "Orders",
      children: ordersSubChildren,
    });
  }
  
  if (hasAnyPermission('transactions')) {
    paymentsChildren.push({ to: `/${restaurantId}/transactions`, label: "Transactions" });
  }

  if (paymentsChildren.length > 0) {
    menuItems.push({
      label: "Payments & invoices",
      icon: HiCreditCard,
      children: paymentsChildren,
    });
  }

  // Settings section
  const settingsChildren = [];
  const businessSubChildren = [];
  
  // Business settings - Owner only
  if (isOwner) {
    businessSubChildren.push(
      {
        to: `/${restaurantId}/settings/business/about`,
        label: "About & Contact",
      },
      {
        to: `/${restaurantId}/settings/business/hours`,
        label: "Business Hours",
      },
      {
        to: `/${restaurantId}/settings/business/special-closures`,
        label: "Special Closures",
      },
      {
        to: `/${restaurantId}/settings/restaurant`,
        label: "Restaurant Settings",
      }
    );
  }

  if (businessSubChildren.length > 0) {
    settingsChildren.push({
      label: "My business",
      children: businessSubChildren,
    });
  }

  // Staff management - Only for admins
  if (hasAnyPermission('staff')) {
    settingsChildren.push({
      label: "Staff & Roles",
      children: [
        {
          to: `/${restaurantId}/settings/staff`,
          label: "Staff Members",
        },
        {
          to: `/${restaurantId}/settings/roles`,
          label: "Roles & Permissions",
        },
      ],
    });
  }

  // Developer tools - Only for owners
  if (isOwner) {
    settingsChildren.push({
      label: "Developer",
      children: [
        {
          to: `/${restaurantId}/settings/developer-tools`,
          label: "Developer Tools",
        },
      ],
    });
  }

  if (settingsChildren.length > 0) {
    menuItems.push({
      label: "Settings",
      icon: HiCog,
      children: settingsChildren,
    });
  }

  return menuItems;
};
