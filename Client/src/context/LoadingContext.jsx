import { createContext, useContext, useState, useCallback } from 'react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const LoadingContext = createContext({
    isLoading: false,
    showLoading: () => { },
    hideLoading: () => { },
});

export const useLoading = () => useContext(LoadingContext);

export const LoadingProvider = ({ children }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('Loading...');

    const showLoading = useCallback((msg = 'Loading...') => {
        setMessage(msg);
        setIsLoading(true);
    }, []);

    const hideLoading = useCallback(() => {
        setIsLoading(false);
    }, []);

    return (
        <LoadingContext.Provider value={{ isLoading, showLoading, hideLoading }}>
            {children}
            {isLoading && <LoadingSpinner.Overlay message={message} />}
        </LoadingContext.Provider>
    );
};
