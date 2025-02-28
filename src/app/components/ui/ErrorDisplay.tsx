'use client';

interface ErrorDisplayProps {
  error: Error;
  resetAction?: () => void;
  fullScreen?: boolean;
  customMessage?: string;
}

export function ErrorDisplay({
  error,
  resetAction,
  fullScreen = true,
  customMessage
}: ErrorDisplayProps) {
  const handleReset = () => {
    if (resetAction) {
      resetAction();
    } else {
      // Default reset action - reload the page
      window.location.href = '/';
    }
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 bg-gray-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4'
    : 'flex items-center justify-center p-4 bg-red-50 rounded-lg border border-red-100';

  return (
    <div className={containerClass}>
      <div className="max-w-md w-full space-y-4 text-center">
        <h2 className={`text-2xl font-bold ${fullScreen ? 'text-white' : 'text-red-800'}`}>
          {customMessage || 'Something went wrong'}
        </h2>
        
        <pre className={`text-sm overflow-auto p-4 rounded-lg ${
          fullScreen ? 'text-red-400 bg-gray-800' : 'text-red-700 bg-red-100'
        }`}>
          {error.message}
        </pre>
        
        <button
          onClick={handleReset}
          className={`px-4 py-2 rounded-lg ${
            fullScreen 
              ? 'bg-indigo-600 text-white hover:bg-indigo-500' 
              : 'bg-red-600 text-white hover:bg-red-700'
          }`}
        >
          {resetAction ? 'Try again' : 'Reload page'}
        </button>
      </div>
    </div>
  );
} 