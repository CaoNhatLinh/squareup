import {
  HiHome,
  HiShoppingBag,
  HiCreditCard,
  HiCog,
  HiUserGroup,
  HiShoppingCart,
} from "react-icons/hi";
export const getMenuItems = (restaurantId, permissions = {}, userRole = 'user') => {
  const menuItems = [];
  const hasAnyPermission = (resource) => {
    if (!permissions[resource]) return false;
    return Object.values(permissions[resource]).some(perm => perm === true);
  };
  const isOwner = userRole !== 'staff';
  menuItems.push({ to: `/restaurant/dashboard`, label: "Home", icon: HiHome });
  if (isOwner || hasAnyPermission('pos')) {
    menuItems.push({ 
      to: `/restaurant/pos`, 
      label: "Point of Sale", 
      icon: HiShoppingCart 
    });
  }
  const itemsChildren = [];
  if (hasAnyPermission('items')) {
    itemsChildren.push({ to: `/restaurant/items`, label: "Item library" });
  }
  if (hasAnyPermission('categories')) {
    itemsChildren.push({ to: `/restaurant/categories`, label: "Categories" });
  }
  if (hasAnyPermission('modifiers')) {
    itemsChildren.push({ to: `/restaurant/modifiers`, label: "Modifiers" });
  }
  if (hasAnyPermission('discounts')) {
    itemsChildren.push({ to: `/restaurant/discounts`, label: "Discounts" });
  }
  if (itemsChildren.length > 0) {
    menuItems.push({
      label: "Items & services",
      icon: HiShoppingBag,
      children: itemsChildren,
    });
  }
  const paymentsChildren = [];
  const ordersSubChildren = [];
  if (hasAnyPermission('orders')) {
    ordersSubChildren.push({ to: `/restaurant/orders`, label: "All orders", badge: true });
  }
  if (hasAnyPermission('reviews')) {
    ordersSubChildren.push({ to: `/restaurant/reviews`, label: "Reviews" });
  }
  if (ordersSubChildren.length > 0) {
    paymentsChildren.push({
      label: "Orders",
      children: ordersSubChildren,
    });
  }
  if (hasAnyPermission('transactions')) {
    paymentsChildren.push({ to: `/restaurant/transactions`, label: "Transactions" });
  }
  if (paymentsChildren.length > 0) {
    menuItems.push({
      label: "Payments & invoices",
      icon: HiCreditCard,
      children: paymentsChildren,
    });
  }
  if (hasAnyPermission('orders') || hasAnyPermission('customers') || isOwner) {
    menuItems.push({
      label: "Customers",
      icon: HiUserGroup,
      to: `/restaurant/customers`,
    });
  }
  const settingsChildren = [];
  const businessSubChildren = [];
  if (isOwner) {
      businessSubChildren.push(
      {
        to: `/restaurant/settings/business/about`,
        label: "About & Contact",
      },
      {
        to: `/restaurant/settings/business/hours`,
        label: "Business Hours",
      },
      {
        to: `/restaurant/settings/business/special-closures`,
        label: "Special Closures",
      },
      {
        to: `/restaurant/settings/restaurant`,
        label: "Restaurant Settings",
      }
    );
  }

  if (isOwner || (permissions['web_builder'] && permissions['web_builder']['access'])) {
    businessSubChildren.push({
      to: `/restaurant/settings/website-builder`,
      label: "Website Builder",
    });
  }
  if (businessSubChildren.length > 0) {
    settingsChildren.push({
      label: "My business",
      children: businessSubChildren,
    });
  }
  if (hasAnyPermission('staff')) {
    settingsChildren.push({
      label: "Staff & Roles",
      children: [
        {
          to: `/restaurant/settings/staff`,
          label: "Staff Members",
        },
        {
          to: `/restaurant/settings/roles`,
          label: "Roles & Permissions",
        },
      ],
    });
  }
  if (isOwner) {
    settingsChildren.push({
      label: "Developer",
      children: [
        {
          to: `/restaurant/settings/developer-tools`,
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
