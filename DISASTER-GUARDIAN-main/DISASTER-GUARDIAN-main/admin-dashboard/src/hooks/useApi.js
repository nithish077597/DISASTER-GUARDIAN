import { useState, useEffect, useCallback } from 'react';

export const useApi = (asyncFn, deps = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(deps.length ? true : false);
  const [error, setError] = useState(null);
  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try { const result = await asyncFn(...args); setData(result); return result; }
    catch (err) { setError(err); return null; }
    finally { setLoading(false); }
  }, deps);
  useEffect(() => { if (deps.length) execute(); }, deps);
  return { data, loading, error, execute, setData, refetch: execute };
};

export const usePolling = (asyncFn, intervalMs = 8000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try { const result = await asyncFn(); setData(result); }
    catch (err) { setError(err); }
    finally { setLoading(false); }
  }, [asyncFn]);
  useEffect(() => { fetch(); const id = setInterval(fetch, intervalMs); return () => clearInterval(id); }, [fetch, intervalMs]);
  return { data, loading, error, refetch: fetch };
};

export const useGeolocation = () => {
  const [position, setPosition] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const supported = typeof navigator !== 'undefined' && 'geolocation' in navigator;
  const request = useCallback(() => {
    if (!supported) { setError(new Error('Geolocation not supported')); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLoading(false); },
      (err) => { setError(err); setLoading(false); },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, [supported]);
  return { position, error, loading, supported, request };
};
