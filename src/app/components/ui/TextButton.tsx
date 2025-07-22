interface TextButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

export function TextButton({ onClick, children, className = "", disabled = false }: TextButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`transition-colors ${
        disabled 
          ? 'text-gray-500 cursor-not-allowed' 
          : 'text-indigo-300 hover:text-indigo-200'
      } ${className}`}
    >
      {children}
    </button>
  );
} 