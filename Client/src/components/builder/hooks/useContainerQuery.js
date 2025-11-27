import { useState, useEffect, useRef } from 'react';
import { useBuilderViewport } from '@/context/BuilderViewportContext';

/**
 * Hook để theo dõi kích thước container hoặc window
 * @param {Object} options - Cấu hình
 * @param {boolean} options.useWindowWidth - Nếu true, sử dụng window width thay vì container width (chỉ áp dụng khi không trong builder)
 * @returns {Object} - { containerRef, width, isMobile, isTablet, isDesktop, isLargeDesktop }
 */
export function useContainerQuery({ useWindowWidth = false } = {}) {
    const containerRef = useRef(null);
    const [width, setWidth] = useState(1200);
    const builderViewMode = useBuilderViewport(); // null nếu không trong builder

    useEffect(() => {
        // Nếu đang trong builder, sử dụng viewMode từ context
        if (builderViewMode) {
            // Map viewMode sang width tương ứng
            const viewportWidths = {
                'mobile': 375,
                'tablet': 768,
                'desktop': 1280,
            };
            setWidth(viewportWidths[builderViewMode] || 1280);
            return; // Không cần observer khi trong builder
        }

        // Nếu sử dụng window width (public mode)
        if (useWindowWidth) {
            const handleResize = () => {
                setWidth(window.innerWidth);
            };

            // Set initial width
            handleResize();

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }

        // Nếu sử dụng container width (mặc định)
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setWidth(entry.contentRect.width);
            }
        });

        observer.observe(containerRef.current);

        return () => observer.disconnect();
    }, [useWindowWidth, builderViewMode]);

    return {
        containerRef,
        width,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        isLargeDesktop: width >= 1280,
    };
}
