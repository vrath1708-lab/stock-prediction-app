import { useCallback, useEffect, useRef, useState } from "react";
import useLiveStream from "./useLiveStream";

const useLiveRefresh = (
  callback,
  {
    intervalMs = 20000,
    enabled = true,
    runOnMount = true,
    revalidateOnFocus = true,
    useServerPush = true,
    streamInclude = ["heartbeat"],
    streamSymbol,
  } = {},
) => {
  const callbackRef = useRef(callback);
  const inFlightRef = useRef(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const refreshNow = useCallback(async () => {
    if (!enabled || inFlightRef.current) return;

    inFlightRef.current = true;
    setRefreshing(true);
    try {
      await callbackRef.current?.();
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Live refresh failed:", error);
    } finally {
      inFlightRef.current = false;
      setRefreshing(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return undefined;

    if (runOnMount) {
      refreshNow();
    }

    const intervalId = setInterval(() => {
      if (!document.hidden) {
        refreshNow();
      }
    }, intervalMs);

    const handleVisibility = () => {
      if (!document.hidden) {
        refreshNow();
      }
    };

    const handleFocus = () => {
      if (revalidateOnFocus) {
        refreshNow();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      clearInterval(intervalId);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled, intervalMs, refreshNow, revalidateOnFocus, runOnMount]);

  const { connected: streamConnected, lastEventAt } = useLiveStream({
    enabled: enabled && useServerPush,
    include: streamInclude,
    symbol: streamSymbol,
    onUpdate: () => {
      if (!document.hidden) {
        refreshNow();
      }
    },
  });

  return {
    lastUpdated,
    refreshing,
    refreshNow,
    streamConnected,
    lastStreamEventAt: lastEventAt,
  };
};

export default useLiveRefresh;
