import { HiCube } from 'react-icons/hi';
import HeroBannerBlock from '@/components/builder/blocks/content/HeroBanner';
import MenuSection from '@/components/builder/blocks/commerce/MenuSection';
import TextBlock from '@/components/builder/blocks/content/TextBlock';
import FooterBlock from '@/components/builder/blocks/core/Footer';
import AlertNoticeBlock from '@/components/builder/blocks/content/AlertNotice';
import PromoGridBlock from '@/components/builder/blocks/marketing/PromoGrid';
import RestaurantInfoBlock from '@/components/builder/blocks/content/RestaurantInfo';
import OurStory from '@/components/builder/blocks/content/OurStory';
import Gallery from '@/components/builder/blocks/content/Gallery';
import Location from '@/components/builder/blocks/content/Location';
import Newsletter from '@/components/builder/blocks/content/Newsletter';
import Catering from '@/components/builder/blocks/content/Catering';
import AboutUs from '@/components/builder/blocks/content/AboutUs';

const BLOCK_COMPONENTS = {
  HERO_BANNER: HeroBannerBlock,
  MENU_SECTION: MenuSection,
  TEXT: TextBlock,
  FOOTER: FooterBlock,
  ALERT_NOTICE: AlertNoticeBlock,
  PROMO_GRID: PromoGridBlock,
  RESTAURANT_INFO: RestaurantInfoBlock,
  OUR_STORY: OurStory,
  GALLERY: Gallery,
  LOCATION: Location,
  NEWSLETTER: Newsletter,
  CATERING: Catering,
  ABOUT_US: AboutUs,
};


export function BlockRenderer({ block, globalStyles, themeColor, globalUseRealData, previewMode, isPublic, onItemClick }) {
  const BlockComponent = BLOCK_COMPONENTS[block.type];
  if (!BlockComponent) {
    console.warn(`Unknown block type: ${block.type}`);
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-300 text-yellow-800">
        Unknown block type: {block.type}
        <div className="mt-2">{<HiCube className="w-5 h-5 inline-block ml-2" />}</div>
      </div>
    );
  }

  return (
    <BlockComponent 
      key={`${block.id}-${JSON.stringify(globalStyles)}-${JSON.stringify(block.props)}`}
      {...block.props}
      globalUseRealData={globalUseRealData}
      previewMode={previewMode}
      globalStyles={globalStyles}
      themeColor={themeColor || globalStyles?.colors?.primary}
      blockId={block.id}
      isPublic={isPublic}
      onItemClick={onItemClick}
    />
  );
}

export function BlockList({ layout = [], globalStyles, themeColor, onItemClick, globalUseRealData, isPublic = false }) {
  if (!Array.isArray(layout) || layout.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">
            No content yet
          </h2>
          <p className="text-gray-500">
            Use the website builder to create your page.
          </p>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full">
      {layout.map((block) => (
        
        <BlockRenderer 
          key={block.id} 
          block={block} 
          globalStyles={globalStyles}
          themeColor={themeColor}
          globalUseRealData={globalUseRealData}
          onItemClick={onItemClick}
          isPublic={isPublic}
        />
      ))}
    </div>
  );
}
