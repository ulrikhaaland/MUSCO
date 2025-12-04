import CloseIcon from '@mui/icons-material/Close';

interface CloseButtonProps {
  onClick: () => void;
  label?: string;
  className?: string;
}

/**
 * Reusable close button matching the app's design system
 * Used in chat footer, exercise sheet, and other overlays
 */
export function CloseButton({ onClick, label = 'Close', className = '' }: CloseButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`flex-shrink-0 w-11 h-11 flex justify-center items-center rounded-full bg-gray-800 text-white hover:bg-gray-700 active:bg-gray-600 transition-colors ${className}`}
    >
      <CloseIcon className="h-6 w-6" />
    </button>
  );
}

