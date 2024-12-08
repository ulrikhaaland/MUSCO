export function LoadingMessage() {
  return (
    <div className="p-4 rounded-lg bg-gray-800 mr-8 w-full">
      <div className="space-y-3">
        {/* First line - longer */}
        <div className="flex space-x-3">
          <div className="w-3/4 h-4 bg-gray-700 rounded animate-pulse" />
          <div className="w-1/4 h-4 bg-gray-700 rounded animate-pulse" />
        </div>
        {/* Second line - shorter */}
        <div className="flex space-x-3">
          <div className="w-2/3 h-4 bg-gray-700 rounded animate-pulse" />
          <div className="w-1/6 h-4 bg-gray-700 rounded animate-pulse" />
        </div>
        {/* Third line - medium */}
        <div className="flex space-x-3">
          <div className="w-1/2 h-4 bg-gray-700 rounded animate-pulse" />
          <div className="w-1/3 h-4 bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    </div>
  );
} 