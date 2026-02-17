export function LoadingMessage({
  visible = true,
  absolute = false,
}: {
  visible?: boolean;
  absolute?: boolean;
}) {
  return (
    <div
      className={`w-full h-full ${absolute ? 'absolute top-0 left-0 z-10' : ''}`}
      style={{ display: visible ? 'flex' : 'none', flexDirection: 'column' }}
      role="status"
      aria-live="polite"
      aria-label="Assistant is thinking"
    >
      <div className="thinking-shell w-full rounded-lg border border-indigo-400/20 bg-gradient-to-br from-gray-800 via-gray-800 to-indigo-950/40 p-4 sm:p-5 shadow-[0_12px_30px_rgba(0,0,0,0.25)]">
        <div className="flex items-center gap-3">
          <div className="thinking-core relative h-10 w-10 shrink-0 rounded-full">
            <span className="thinking-ring absolute inset-0 rounded-full" />
            <span className="thinking-dot absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-200" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-sm sm:text-base font-medium text-gray-100">
              Thinking
              <span className="thinking-dots" aria-hidden="true">
                <span />
                <span />
                <span />
              </span>
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2.5">
          <div className="thinking-line h-2.5 w-[82%] rounded-full" />
          <div className="thinking-line h-2.5 w-[68%] rounded-full" />
          <div className="thinking-line h-2.5 w-[74%] rounded-full" />
        </div>
      </div>

      <div className="flex-1" />

      <style jsx>{`
        .thinking-shell {
          backdrop-filter: blur(5px);
        }

        .thinking-core {
          background: radial-gradient(
            circle at 30% 30%,
            rgba(199, 210, 254, 0.35),
            rgba(99, 102, 241, 0.05) 58%,
            transparent 70%
          );
        }

        .thinking-ring {
          border: 1.5px solid rgba(129, 140, 248, 0.4);
          box-shadow: 0 0 22px rgba(99, 102, 241, 0.22);
          animation: thinkingSpin 2.5s linear infinite;
        }

        .thinking-dot {
          box-shadow: 0 0 14px rgba(199, 210, 254, 0.8);
          animation: thinkingPulse 1.2s ease-in-out infinite;
        }

        .thinking-dots {
          display: inline-flex;
          align-items: center;
          gap: 0.2rem;
        }

        .thinking-dots span {
          width: 0.34rem;
          height: 0.34rem;
          border-radius: 9999px;
          background: rgba(165, 180, 252, 0.95);
          animation: thinkingBounce 1s infinite;
        }

        .thinking-dots span:nth-child(2) {
          animation-delay: 0.15s;
        }

        .thinking-dots span:nth-child(3) {
          animation-delay: 0.3s;
        }

        .thinking-line {
          position: relative;
          overflow: hidden;
          background: linear-gradient(
            90deg,
            rgba(55, 65, 81, 0.8),
            rgba(79, 70, 229, 0.3),
            rgba(55, 65, 81, 0.8)
          );
          background-size: 220% 100%;
          animation: thinkingSweep 1.7s ease-in-out infinite;
        }

        @keyframes thinkingSpin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes thinkingPulse {
          0%,
          100% {
            opacity: 0.5;
            transform: translate(-50%, -50%) scale(0.9);
          }
          50% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.18);
          }
        }

        @keyframes thinkingBounce {
          0%,
          80%,
          100% {
            transform: translateY(0);
            opacity: 0.45;
          }
          40% {
            transform: translateY(-3px);
            opacity: 1;
          }
        }

        @keyframes thinkingSweep {
          0% {
            background-position: 120% 0;
          }
          100% {
            background-position: -120% 0;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .thinking-ring,
          .thinking-dot,
          .thinking-dots span,
          .thinking-line {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
}
