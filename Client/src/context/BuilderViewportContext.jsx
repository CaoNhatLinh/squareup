import { createContext, useContext } from 'react';

/**
 * Context để quản lý viewport mode trong builder
 * Giá trị: 'desktop' | 'tablet' | 'mobile' | null (null = public mode)
 */
const BuilderViewportContext = createContext(null);

export const BuilderViewportProvider = BuilderViewportContext.Provider;

/**
 * Hook để lấy viewport mode hiện tại
 * @returns {string|null} viewMode - 'desktop', 'tablet', 'mobile', hoặc null nếu không trong builder
 */
export const useBuilderViewport = () => {
    return useContext(BuilderViewportContext);
};
