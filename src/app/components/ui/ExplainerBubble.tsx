import React from 'react';

type Props = {
  screenPos?: { x: number; y: number } | null;
  data?: { text: string; quick_replies: string[] } | null;
};

export function ExplainerBubble({ screenPos, data }: Props) {
  if (!data) return null;
  const style: React.CSSProperties = screenPos
    ? {
        position: 'absolute',
        left: Math.round(screenPos.x + 16),
        top: Math.round(screenPos.y - 8),
      }
    : {
        position: 'absolute',
        right: 16,
        top: 16,
      };

  return (
    <div className="explainer-bubble" style={{ ...style, maxWidth: 320, pointerEvents: 'auto', zIndex: 55 }} aria-live="polite">
      <div className="bg-gray-900/95 text-white border border-gray-700 rounded-lg shadow-xl p-3">
        <p className="text-sm leading-snug whitespace-pre-wrap">{data.text}</p>
        <div className="mt-2 flex gap-2">
          {data.quick_replies.map((q, i) => (
            <button key={i} className="qr-btn text-xs px-2 py-1 rounded-md bg-indigo-700 hover:bg-indigo-600" data-intent="explore-qr">
              {q}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}


