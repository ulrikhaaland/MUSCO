export function LoadingMessage({
  visible = true,
  absolute = false,
  containerHeight = 0,
}: {
  visible?: boolean;
  absolute?: boolean;
  containerHeight?: number;
}) {
  // Constants for shimmer group sizing
  const SHIMMER_GROUP_HEIGHT = 65; // Height of one shimmer group including spacing
  const PADDING_TOP = 16;
  const PADDING_BOTTOM = 20;
  const MIN_GROUPS = 1;
  const MAX_GROUPS = 8;

  // Always show exactly 2 paragraphs of shimmer for consistent, compact loading state
  const shimmerRowCount = 2;
  return (
    <div
      className={`w-full h-full ${absolute ? 'absolute top-0 left-0 z-10' : ''}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Compact shimmer content - only as tall as needed */}
      <div
        className={`${visible ? 'bg-gray-800' : 'bg-transparent'} transition-colors duration-200 w-full`}
        style={{
          borderRadius: '8px',
          padding: '16px',
          paddingBottom: '20px',
        }}
      >
        {/* Shimmer groups container */}
        <div>
          {Array.from({ length: shimmerRowCount }).map((_, groupIndex) => (
            <div
              key={`group-${groupIndex}`}
              className={
                visible
                  ? groupIndex > 0
                    ? 'mt-4'
                    : ''
                  : 'opacity-0' + (groupIndex > 0 ? ' mt-4' : '')
              }
            >
              {/* First line - longer */}
              <div className="flex space-x-3 mb-2">
                <div className="shimmer w-3/4 h-4 bg-gray-700 rounded" />
                <div className="shimmer w-1/4 h-4 bg-gray-700 rounded" />
              </div>
              {/* Second line - shorter */}
              <div className="flex space-x-3 mb-2">
                <div className="shimmer w-2/3 h-4 bg-gray-700 rounded" />
                <div className="shimmer w-1/6 h-4 bg-gray-700 rounded" />
              </div>
              {/* Third line - medium */}
              <div className="flex space-x-3">
                <div className="shimmer w-1/2 h-4 bg-gray-700 rounded" />
                <div className="shimmer w-1/3 h-4 bg-gray-700 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Transparent spacer to fill remaining height */}
      <div className="flex-1" />

      <style jsx>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }

        .shimmer::after {
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          transform: translateX(-100%);
          background-image: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0) 0,
            rgba(255, 255, 255, 0.1) 20%,
            rgba(255, 255, 255, 0.2) 60%,
            rgba(255, 255, 255, 0)
          );
          animation: shimmer 1.5s infinite;
          content: '';
        }

        @keyframes shimmer {
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>
    </div>
  );
}
