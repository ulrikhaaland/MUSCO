export function LoadingMessage({ visible = true }: { visible?: boolean }) {
  return (
    <div className={`p-4 rounded-lg ${visible ? 'bg-gray-800' : 'bg-transparent'} mr-8 w-full transition-colors duration-200`}>
      <div className={visible ? 'space-y-3' : 'opacity-0 space-y-3'}>
        {/* First line - longer */}
        <div className="flex space-x-3">
          <div className="shimmer w-3/4 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-1/4 h-4 bg-gray-700 rounded" />
        </div>
        {/* Second line - shorter */}
        <div className="flex space-x-3">
          <div className="shimmer w-2/3 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-1/6 h-4 bg-gray-700 rounded" />
        </div>
        {/* Third line - medium */}
        <div className="flex space-x-3">
          <div className="shimmer w-1/2 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-1/3 h-4 bg-gray-700 rounded" />
        </div>
      </div>
      <div className={visible ? 'space-y-3 mt-2' : 'opacity-0 space-y-3 mt-2'}>
        {/* First line - longer */}
        <div className="flex space-x-3">
          <div className="shimmer w-3/4 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-1/4 h-4 bg-gray-700 rounded" />
        </div>
        {/* Second line - shorter */}
        <div className="flex space-x-3">
          <div className="shimmer w-2/3 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-1/6 h-4 bg-gray-700 rounded" />
        </div>
        {/* Third line - medium */}
        <div className="flex space-x-3">
          <div className="shimmer w-1/2 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-1/3 h-4 bg-gray-700 rounded" />
        </div>
      </div>
      <div className={visible ? 'space-y-3 mt-2' : 'opacity-0 space-y-3 mt-2'}>
        {/* First line - longer */}
        <div className="flex space-x-3">
          <div className="shimmer w-3/4 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-1/4 h-4 bg-gray-700 rounded" />
        </div>
        {/* Second line - shorter */}
        <div className="flex space-x-3">
          <div className="shimmer w-2/3 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-1/6 h-4 bg-gray-700 rounded" />
        </div>
        {/* Third line - medium */}
        <div className="flex space-x-3">
          <div className="shimmer w-1/2 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-1/3 h-4 bg-gray-700 rounded" />
        </div>
      </div>
      <div className={visible ? 'space-y-3 mt-2' : 'opacity-0 space-y-3 mt-2'}>
        {/* First line - longer */}
        <div className="flex space-x-3">
          <div className="shimmer w-3/4 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-1/4 h-4 bg-gray-700 rounded" />
        </div>
        {/* Second line - shorter */}
        <div className="flex space-x-3">
          <div className="shimmer w-2/3 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-5/6 h-4 bg-gray-700 rounded" />
        </div>
        {/* Third line - medium */}
        <div className="flex space-x-3">
          <div className="shimmer w-4/6 h-4 bg-gray-700 rounded" />
          <div className="shimmer w-6/6 h-4 bg-gray-700 rounded" />
        </div>
      </div>
      
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
