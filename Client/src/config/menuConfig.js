import { HiHome, HiShoppingBag, HiCreditCard, HiGlobeAlt, HiUserGroup, HiChartBar, HiUsers, HiCog, HiTicket } from 'react-icons/hi';

export const menuItems = [
  { to: '/dashboard', label: 'Home', icon: HiHome },
  {
    label: 'Items & services',
    icon: HiShoppingBag,
    children: [
      { to: '/items', label: 'Item library' },
    //   { to: '/items/channel-listings', label: 'Channel listings' },
    //   { to: '/items/service-library', label: 'Service library' },
    //   { to: '/items/image-library', label: 'Image library' },
      { to: '/modifiers', label: 'Modifiers' },
      { to: '/categories', label: 'Categories' },
      { to: '/discounts', label: 'Discounts' },
    ]
  },
  {  label: 'Payments & invoices', icon: HiCreditCard,
    children: [ 
      { label: 'Orders', 
        children: [
          { to: '/orders', label: 'All orders', badge: true },
       ],
      }
  ],
  },
//   { to: '/online', label: 'Online', icon: HiGlobeAlt },
//   { to: '/customers', label: 'Customers', icon: HiUserGroup },
//   { to: '/reports', label: 'Reports', icon: HiChartBar },
//   { to: '/staff', label: 'Staff', icon: HiUsers },
  {
    label: 'Settings',
    icon: HiCog,
    children: [
    //   {
    //     label: 'Account & Settings',
    //     children: [
    //       { to: '/settings/personal-information', label: 'Personal information' },
    //       { to: '/settings/signin-security', label: 'Sign in & security' },
    //       { to: '/settings/preferences', label: 'Preferences' },
    //     ]
    //   },
      {
        label: 'My business',
        children: [
          { to: '/settings/business/about', label: 'About & Contact' },
          { to: '/settings/business/hours', label: 'Business Hours' },
          { to: '/settings/business/special-closures', label: 'Special Closures' },
        ]
      },
      {
        label: 'Developer',
        children: [
          { to: '/settings/developer-tools', label: 'Developer Tools' },
        ]
      },
    ]
  },
]
