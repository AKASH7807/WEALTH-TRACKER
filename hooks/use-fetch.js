import { toast } from "sonner";
import { useState, useRef, useCallback } from "react";

const useFetch = (cb) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);
  const cacheRef = useRef({});
  const pendingRef = useRef({});

  const fn = useCallback(async (...args) => {
    // Create cache key from function args
    const cacheKey = JSON.stringify(args);

    // Return cached data if available
    if (cacheRef.current[cacheKey]) {
      setData(cacheRef.current[cacheKey]);
      return cacheRef.current[cacheKey];
    }

    // Return pending request if already in flight (deduplication)
    if (pendingRef.current[cacheKey]) {
      return pendingRef.current[cacheKey];
    }

    setLoading(true);
    setError(null);

    try {
      const promise = cb(...args);
      pendingRef.current[cacheKey] = promise;

      const response = await promise;
      setData(response);
      cacheRef.current[cacheKey] = response;
      delete pendingRef.current[cacheKey];
      setError(null);
      return response;
    } catch (error) {
      setError(error);
      toast.error(error.message);
      delete pendingRef.current[cacheKey];
      throw error;
    } finally {
      setLoading(false);
    }
  }, [cb]);

  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  return { data, loading, error, fn, setData, clearCache };
};

export default useFetch;
