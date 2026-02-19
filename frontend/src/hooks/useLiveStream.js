import { useEffect, useMemo, useRef, useState } from "react";
import { API_BASE_URL } from "../services/api";

const useLiveStream = ({
  enabled = true,
  include = ["heartbeat"],
  symbol,
  onUpdate,
} = {}) => {
  const [connected, setConnected] = useState(false);
  const [lastEventAt, setLastEventAt] = useState(null);
  const onUpdateRef = useRef(onUpdate);
  const includeKey = useMemo(
    () => (Array.isArray(include) ? include.join(",") : "heartbeat"),
    [include],
  );

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled) return undefined;

    const params = new URLSearchParams();
    if (includeKey.length) {
      params.set("include", includeKey);
    }
    if (symbol) {
      params.set("symbol", symbol);
    }

    const base = API_BASE_URL.replace(/\/$/, "");
    const url = `${base}/live/stream${params.toString() ? `?${params.toString()}` : ""}`;
    const eventSource = new EventSource(url);

    const handleConnected = () => {
      setConnected(true);
    };

    const handleUpdate = (event) => {
      setConnected(true);
      setLastEventAt(new Date());
      try {
        const payload = JSON.parse(event.data);
        onUpdateRef.current?.(payload);
      } catch (error) {
        console.error("Failed to parse live stream payload:", error);
      }
    };

    eventSource.addEventListener("connected", handleConnected);
    eventSource.addEventListener("update", handleUpdate);

    eventSource.onerror = () => {
      setConnected(false);
    };

    return () => {
      eventSource.removeEventListener("connected", handleConnected);
      eventSource.removeEventListener("update", handleUpdate);
      eventSource.close();
      setConnected(false);
    };
  }, [enabled, symbol, includeKey]);

  return {
    connected,
    lastEventAt,
  };
};

export default useLiveStream;
