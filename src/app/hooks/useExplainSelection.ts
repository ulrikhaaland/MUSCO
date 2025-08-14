import { useEffect, useRef, useState } from 'react';

// Simple client-side memo cache to avoid re-streaming when revisiting a part
const clientCache = new Map<string, { text: string }>();

type Input = {
  exploreOn: boolean;
  selectedPart?: { id: string; displayName: string; partType: string; side?: 'L' | 'R' | 'unknown' } | null;
  language: 'EN' | 'NB';
  readingLevel?: 'simple' | 'standard' | 'pro';
};

export function useExplainSelection({
  exploreOn,
  selectedPart,
  language,
  readingLevel = 'standard',
}: Input) {
  const [data, setData] = useState<null | { text: string }>(null);
  const ctrl = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!exploreOn || !selectedPart) {
      setData(null);
      return;
    }
    // Check client cache first
    const key = `${selectedPart.id}|${language}|${readingLevel}`;
    if (clientCache.has(key)) {
      const cached = clientCache.get(key)!;
      setData({ text: cached.text });
      return;
    }

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
          }),
          signal: ac.signal,
        });

        if (!res.ok || !res.body) {
          console.warn('[useExplainSelection] bad response', res.status);
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
                setData({ text: full });
              } else if (msg.type === 'final') {
                const text = msg.payload?.text ?? full;
                const payload = { text };
                clientCache.set(key, payload);
                setData(payload);
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
  }, [exploreOn, selectedPart?.id, language, readingLevel]);

  return data;
}


