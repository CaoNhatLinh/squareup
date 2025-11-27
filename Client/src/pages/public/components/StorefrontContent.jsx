import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useShop } from "@/context/ShopContext";
import { BlockList } from "@/components/builder/BlockRenderer";
import { findRestaurantBySlug } from "@/api/siteConfig";
import useAppStore from "@/store/useAppStore";
import HeaderBlock from "@/components/builder/blocks/core/Header";
import FooterBlock from "@/components/builder/blocks/core/Footer";
import { DEFAULT_GLOBAL_STYLES } from "@/components/builder/config/defaults";
import { generateNavLinks } from "@/pages/public/utils/storefrontUtils";
import { DAY_LABELS } from "@/constants/scheduleConstants";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

const normalizeHours = (hoursObj) => {
    if (!hoursObj) return [];
    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday",
    ];
    return days.map((dayKey) => {
        const dayData = hoursObj[dayKey] || {};
        const dayLabel =
            DAY_LABELS.find((d) => d.value === dayKey)?.label || dayKey;
        let open = "",
            close = "";
        if (dayData.timeSlots && dayData.timeSlots.length > 0) {
            open = dayData.timeSlots[0].open;
            close = dayData.timeSlots[0].close;
        } else if (dayData.open && dayData.close) {
            open = dayData.open;
            close = dayData.close;
        }
        return { day: dayLabel, open, close, closed: dayData.isClosed };
    });
};

export default function StorefrontContent() {
    const { slug } = useParams();
    const {
        restaurant,
        setRestaurant,
        setCategories,
        setItems,
        setModifiers,
        setActiveDiscounts,
    } = useShop();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [siteConfig, setSiteConfig] = useState(null);

    useEffect(() => {
        async function loadRestaurant() {
            if (!slug) {
                setError("No slug provided");
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                const result = await findRestaurantBySlug(slug);
                if (!result) {
                    setError("Restaurant not found");
                    setLoading(false);
                    return;
                }

                const { restaurantId, data } = result;
                useAppStore.getState().setRestaurantId(restaurantId);
                setRestaurant(data);
                setCategories(data.categories ? Object.values(data.categories) : []);
                setItems(data.items || {});
                setModifiers(data.modifiers || {});
                setActiveDiscounts(data.discounts || {});
                setSiteConfig(data.siteConfig || DEFAULT_GLOBAL_STYLES);
                setLoading(false);
            } catch (err) {
                console.error("Error loading restaurant:", err);
                setError("Failed to load restaurant data");
                setLoading(false);
            }
        }
        loadRestaurant();
    }, [
        slug,
        setRestaurant,
        setCategories,
        setItems,
        setModifiers,
        setActiveDiscounts,
    ]);

    if (loading)
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white">
                <LoadingSpinner size="xl" color="indigo" />
                <p className="mt-4 text-gray-500 font-medium">Loading store...</p>
            </div>
        );
    if (error || !restaurant)
        return (
            <div className="flex items-center justify-center min-h-screen">
                {error || "Not Found"}
            </div>
        );

    const globalStyles = siteConfig?.globalStyles || DEFAULT_GLOBAL_STYLES;
    const themeColor = globalStyles?.colors?.primary || "#F97316";
    const navLinks = generateNavLinks(siteConfig?.layout || []);

    const headerConfig = {
        ...(siteConfig?.headerConfig || {}),
        title: restaurant.name || "My Restaurant",
        navigation: {
            ...(siteConfig?.headerConfig?.navigation || {}),
            links: navLinks.length > 0 ? navLinks : [],
        },
        sticky: siteConfig?.headerConfig?.sticky ?? true,
        useRealData: true,
        showCart: false,
    };

    const footerConfig = {
        ...(siteConfig?.footerConfig || {}),
        links: navLinks,
        useRealData: true,
    };

    const layout = (siteConfig?.layout || []).map((block) => ({
        ...block,
        props: {
            ...block.props,
            useRealData: true,
            ...(block.type === "MENU_SECTION" && block.props?.navConfig
                ? {
                    navConfig: {
                        ...block.props.navConfig,
                        isSticky: headerConfig.sticky || false,
                    },
                }
                : {}),
        },
    }));

    return (
        <div
            className="h-screen w-full scroll-smooth overflow-y-auto overflow-x-hidden flex flex-col relative"
            style={{
                fontFamily: globalStyles.typography?.bodyFont,
                backgroundColor: globalStyles.colors?.background,
                color: globalStyles.colors?.text,
            }}
        >
            <div
                className={headerConfig.sticky ? "sticky top-0 z-40" : "relative z-40"}
            >
                <HeaderBlock
                    config={headerConfig}
                    globalStyles={globalStyles}
                    blockId={"HEADER"}
                    globalUseRealData={true}
                    slug={slug}
                    isPublic={true}
                    onElementClick={() => { }}
                />
            </div>

            <main className="flex-1 relative ">
                <BlockList
                    layout={layout}
                    globalStyles={globalStyles}
                    themeColor={themeColor}
                    globalUseRealData={true}
                    isPublic={true}
                />
            </main>

            <FooterBlock
                config={footerConfig}
                globalStyles={globalStyles}
                blockId="FOOTER"
                globalUseRealData={true}
                isPublic={true}
                restaurantData={{
                    name: restaurant.name,
                    description: restaurant.description,
                    address: restaurant.address,
                    phone: restaurant.phone,
                    email: restaurant.email,
                }}
                socialIcons={restaurant.socialMedia || []}
                openingHours={normalizeHours(restaurant.hours)}
            />
        </div >
    );
}
