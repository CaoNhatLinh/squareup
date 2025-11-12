import { HiHome, HiShoppingBag, HiCreditCard, HiCog, } from 'react-icons/hi';

export const getMenuItems = (restaurantId) => [
  { to: `/${restaurantId}/dashboard`, label: 'Home', icon: HiHome },
  {
    label: 'Items & services',
    icon: HiShoppingBag,
    children: [
      { to: `/${restaurantId}/items`, label: 'Item library' },
      { to: `/${restaurantId}/categories`, label: 'Categories' },
      { to: `/${restaurantId}/modifiers`, label: 'Modifiers' },
      { to: `/${restaurantId}/discounts`, label: 'Discounts' },
    ]
  },
  {  label: 'Payments & invoices', icon: HiCreditCard,
    children: [ 
      { label: 'Orders', 
        children: [
          { to: `/${restaurantId}/orders`, label: 'All orders', badge: true },
       ],
      }
  ],
  },
  {
    label: 'Settings',
    icon: HiCog,
    children: [
      {
        label: 'My business',
        children: [
          { to: `/${restaurantId}/settings/business/about`, label: 'About & Contact' },
          { to: `/${restaurantId}/settings/business/hours`, label: 'Business Hours' },
          { to: `/${restaurantId}/settings/business/special-closures`, label: 'Special Closures' },
          { to: `/${restaurantId}/settings/restaurant`, label: 'Restaurant Settings' },
        ]
      },
      {
        label: 'Developer',
        children: [
          { to: `/${restaurantId}/settings/developer-tools`, label: 'Developer Tools' },
        ]
      },
    ]
  },
]
