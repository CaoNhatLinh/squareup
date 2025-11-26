

export const DEFAULT_SITE_CONFIG = {
  themeColor: '#F97316',
  layout: [
    {
      id: 'default-hero',
      type: 'HERO_BANNER',
      props: {
        title: 'Welcome to Our Restaurant',
        subtitle: 'Delicious food, great atmosphere',
        imageURL: ''
      }
    },
    {
      id: 'default-menu',
        type: 'MENU_SECTION',
      props: {
        title: 'Our Menu',
        columns: 3
      }
    }
  ]
};
