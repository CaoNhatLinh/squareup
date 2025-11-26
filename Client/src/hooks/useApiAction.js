import { useCallback, useState } from "react";

export default function useApiAction() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const call = useCallback(async (fn, ...args) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fn(...args);
      return res;
    } catch (err) {
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { call, loading, error };
}
