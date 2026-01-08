import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Simple client-side memo cache to avoid re-streaming when revisiting a part
const clientCache = new Map<string, { text: string }>();

// Track in-flight requests so they can finish caching even when user switches parts
const inFlightRequests = new Set<string>();

type Input = {
  exploreOn: boolean;
  selectedPart?: { id: string; displayName: string; partType: string; side?: 'L' | 'R' | 'unknown' } | null;
  language: 'EN' | 'NB';
  readingLevel?: 'simple' | 'standard' | 'pro';
  // Optional: change this value to force a re-fetch even if cached
  refreshKey?: number;
};

export function useExplainSelection({
  exploreOn,
  selectedPart,
  language,
  readingLevel = 'standard',
  refreshKey,
}: Input) {
  const [state, setState] = useState<{ text: string | null; rateLimited: boolean }>({ text: null, rateLimited: false });
  const { user } = useAuth();
  const lastRefreshRef = useRef<number | undefined>(undefined);
  // Track which part ID this effect instance is responsible for
  const activePartIdRef = useRef<string | null>(null);

  const SUPPRESS_KEY = 'explain_rate_limited_until';
  const now = () => Date.now();
  const getSuppressedUntil = (): number => {
    try {
      const v = localStorage.getItem(SUPPRESS_KEY);
      return v ? parseInt(v, 10) || 0 : 0;
    } catch {
      return 0;
    }
  };
  const setSuppression = (msFromNow: number) => {
    try {
      localStorage.setItem(SUPPRESS_KEY, String(now() + msFromNow));
    } catch {}
  };

  useEffect(() => {
    if (!exploreOn || !selectedPart) {
      activePartIdRef.current = null;
      setState({ text: null, rateLimited: false });
      return;
    }

    const partId = selectedPart.id;
    activePartIdRef.current = partId;

    // Early exit if we are currently rate-limited (suppressed window active)
    const suppressedUntil = getSuppressedUntil();
    if (suppressedUntil > now()) {
      setState({ text: null, rateLimited: true });
      return;
    }

    // Check client cache first unless refreshKey changed
    const key = `${partId}|${language}|${readingLevel}`;
    const refreshChanged = refreshKey !== undefined && refreshKey !== lastRefreshRef.current;
    if (!refreshChanged && clientCache.has(key)) {
      const cached = clientCache.get(key)!;
      setState({ text: cached.text, rateLimited: false });
      return;
    }
    lastRefreshRef.current = refreshKey;

    // Skip if there's already an in-flight request for this exact key
    if (inFlightRequests.has(key)) {
      return;
    }

    // Clear old text immediately when starting a new request (prevents flash of old content)
    setState({ text: null, rateLimited: false });

    // Capture values for the async closure
    const capturedPart = { ...selectedPart };
    const capturedUser = user;

    const timer = setTimeout(async () => {
      // Mark request as in-flight
      inFlightRequests.add(key);

      try {
        console.log('[useExplainSelection] start stream for', partId);
        const res = await fetch('/api/explain-selection?stream=1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            partId: capturedPart.id,
            displayName: capturedPart.displayName,
            partType: capturedPart.partType ?? 'muscle',
            side: capturedPart.side ?? 'unknown',
            language,
            readingLevel,
            uid: capturedUser?.uid,
            isSubscriber: !!capturedUser?.profile?.isSubscriber,
          }),
          // No abort signal - let request complete for caching
        });

        if (!res.ok || !res.body) {
          console.warn('[useExplainSelection] bad response', res.status);
          if (res.status === 429) {
            setSuppression(10 * 60 * 1000);
            // Only update state if this part is still active
            if (activePartIdRef.current === partId) {
              setState({ text: null, rateLimited: true });
            }
          }
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        let full = '';

        const parseSse = (chunk: string) => {
          buffer += chunk;
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';
          for (const part of parts) {
            const line = part.trim();
            if (!line.startsWith('data:')) continue;
            const jsonStr = line.slice(5).trim();
            try {
              const msg = JSON.parse(jsonStr);
              if (msg.type === 'delta' && typeof msg.delta === 'string') {
                full += msg.delta;
                // Only update UI if this part is still the active one
                if (activePartIdRef.current === partId) {
                  setState({ text: full, rateLimited: false });
                }
              } else if (msg.type === 'final') {
                const text = msg.payload?.text ?? full;
                // Always cache, regardless of whether part is still active
                clientCache.set(key, { text });
                // Only update UI if this part is still the active one
                if (activePartIdRef.current === partId) {
                  setState({ text, rateLimited: false });
                }
              }
            } catch {}
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          const text = decoder.decode(value, { stream: true });
          parseSse(text);
        }
      } catch (e) {
        console.error('[useExplainSelection] stream error', e);
      } finally {
        inFlightRequests.delete(key);
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      // Don't abort - let the request finish for caching
      // Just mark that this part is no longer active for UI updates
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploreOn, selectedPart?.id, language, readingLevel, refreshKey]);

  return state;
}


