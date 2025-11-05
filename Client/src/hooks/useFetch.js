import { useState, useEffect, useRef } from 'react';

export function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);
  const fetchingRef = useRef(false);
  const hasInitializedRef = useRef(false);

  const fetchData = async () => {
    if (fetchingRef.current) {
      console.log('Fetch already in progress, skipping...');
      return;
    }

    fetchingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      const result = await fetchFn();
      if (isMountedRef.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
        console.error('Fetch error:', err);
      }
    } finally {
      fetchingRef.current = false;
    }
  };

  useEffect(() => {
    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      fetchData();
    }
  }, deps);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  return { data, loading, error, refetch: fetchData };
}
