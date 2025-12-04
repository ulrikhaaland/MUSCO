import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';

// Simple client-side memo cache to avoid re-streaming when revisiting a part
const clientCache = new Map<string, { text: string }>();

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
  const ctrl = useRef<AbortController | null>(null);
  const { user } = useAuth();
  const lastRefreshRef = useRef<number | undefined>(undefined);

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
      setState({ text: null, rateLimited: false });
      return;
    }

    // Early exit if we are currently rate-limited (suppressed window active)
    const suppressedUntil = getSuppressedUntil();
    if (suppressedUntil > now()) {
      setState({ text: null, rateLimited: true });
      return;
    }
    // Check client cache first unless refreshKey changed
    const key = `${selectedPart.id}|${language}|${readingLevel}`;
    const refreshChanged = refreshKey !== undefined && refreshKey !== lastRefreshRef.current;
    if (!refreshChanged && clientCache.has(key)) {
      const cached = clientCache.get(key)!;
      setState({ text: cached.text, rateLimited: false });
      return;
    }
    lastRefreshRef.current = refreshKey;

    const ac = new AbortController();
    ctrl.current?.abort();
    ctrl.current = ac;

    const timer = setTimeout(async () => {
      try {
        console.log('[useExplainSelection] start stream');
        const res = await fetch('/api/explain-selection?stream=1', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'text/event-stream',
          },
          body: JSON.stringify({
            partId: selectedPart.id,
            displayName: selectedPart.displayName,
            partType: selectedPart.partType ?? 'muscle',
            side: selectedPart.side ?? 'unknown',
            language,
            readingLevel,
            uid: user?.uid,
            isSubscriber: !!user?.profile?.isSubscriber,
          }),
          signal: ac.signal,
        });

        if (!res.ok || !res.body) {
          console.warn('[useExplainSelection] bad response', res.status);
          if (res.status === 429) {
            // Mark as rate-limited and set a suppression window (fallback 10 minutes)
            setState({ text: null, rateLimited: true });
            setSuppression(10 * 60 * 1000);
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
                setState({ text: full, rateLimited: false });
              } else if (msg.type === 'final') {
                const text = msg.payload?.text ?? full;
                const payload = { text };
                clientCache.set(key, payload);
                setState({ text, rateLimited: false });
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
        if ((e as any)?.name !== 'AbortError') {
          console.error('[useExplainSelection] stream error', e);
        }
      }
    }, 200);

    return () => {
      clearTimeout(timer);
      ac.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exploreOn, selectedPart?.id, language, readingLevel, refreshKey]);

  return state;
}


