'use client';

import { useRef, useEffect, forwardRef, useImperativeHandle } from 'react';

export interface ChatInputProps {
  /** Current input value */
  value: string;
  /** Called when value changes */
  onChange: (value: string) => void;
  /** Called when user submits (Enter or button click) */
  onSend: () => void;
  /** Whether a request is in progress */
  isLoading?: boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Maximum height before scrolling (px) */
  maxHeight?: number;
  /** Visual variant: default (desktop), compact (smaller), mobile (violet theme) */
  variant?: 'default' | 'compact' | 'mobile';
  /** Whether input is disabled (beyond loading state) */
  disabled?: boolean;
  /** Additional class for the container */
  className?: string;
}

export interface ChatInputHandle {
  focus: () => void;
  blur: () => void;
}

/**
 * Reusable chat input with auto-resize textarea and send button.
 * Supports loading state, disabled state, and keyboard shortcuts (Enter to send).
 */
export const ChatInput = forwardRef<ChatInputHandle, ChatInputProps>(
  function ChatInput(
    {
      value,
      onChange,
      onSend,
      isLoading = false,
      placeholder = 'Type your message...',
      maxHeight = 120,
      variant = 'default',
      disabled = false,
      className = '',
    },
    ref
  ) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Expose focus/blur methods to parent
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      blur: () => textareaRef.current?.blur(),
    }));

    // Auto-resize textarea on value change
    useEffect(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        const newHeight = Math.min(textarea.scrollHeight, maxHeight);
        textarea.style.height = `${newHeight}px`;
      }
    }, [value, maxHeight]);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (value.trim() && !isLoading && !disabled) {
          onSend();
        }
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSend();
      }
    };

    const isInputDisabled = disabled; // Loading doesn't disable typing, only sending
    const canSend = value.trim() && !isLoading && !disabled;

    // Variant-specific styles
    const containerStyles = {
      default: 'bg-gray-700 rounded-lg',
      compact: 'bg-gray-800 rounded-xl',
      mobile: 'bg-gray-800 rounded-xl',
    };

    const inputStyles = {
      default: 'px-4 py-3',
      compact: 'px-3 py-2',
      mobile: 'px-3 py-2 text-sm',
    };

    const ringStyles = {
      default: 'focus-within:ring-indigo-600',
      compact: 'focus-within:ring-indigo-600',
      mobile: 'focus-within:ring-violet-500/50',
    };

    const buttonActiveStyles = {
      default: 'text-indigo-500 hover:text-indigo-400 hover:bg-gray-600/50',
      compact: 'text-indigo-500 hover:text-indigo-400 hover:bg-gray-600/50',
      mobile: 'text-violet-400 hover:text-violet-300',
    };

    const isMobile = variant === 'mobile';

    return (
      <form onSubmit={handleSubmit} className={`relative ${className}`}>
        <div className={`relative flex items-center ${containerStyles[variant]} focus-within:ring-2 ${ringStyles[variant]}`}>
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder={placeholder}
            disabled={isInputDisabled}
            className={`flex-1 bg-transparent ${inputStyles[variant]} focus:outline-none resize-none text-white placeholder-gray-400 disabled:opacity-50 overflow-y-auto scrollbar-none`}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          />
          <button
            type="submit"
            disabled={!canSend}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              canSend
                ? buttonActiveStyles[variant]
                : 'text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : isMobile ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 24 24"
              >
                <circle cx="12" cy="12" r="11" fill="currentColor" />
                <path 
                  d="M12 6.5l-5 5h3v5h4v-5h3l-5-5z"
                  fill="#1f2937"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            )}
          </button>
        </div>
      </form>
    );
  }
);
