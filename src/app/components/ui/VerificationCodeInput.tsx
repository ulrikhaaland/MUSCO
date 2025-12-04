'use client';

import { useRef } from 'react';

interface VerificationCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (code: string) => void;
  error?: string | null;
  isLoading?: boolean;
  placeholder?: string;
  submitButtonText?: string;
  submitButtonLoadingText?: string;
  submitButtonVariant?: 'primary' | 'danger';
  maxLength?: number;
  autoFocus?: boolean;
}

export function VerificationCodeInput({
  value,
  onChange,
  onSubmit,
  error,
  isLoading = false,
  placeholder: _placeholder = "Enter 6-digit code",
  submitButtonText = "Submit",
  submitButtonLoadingText = "Processing...",
  submitButtonVariant = 'primary',
  maxLength = 6,
  autoFocus = true,
}: VerificationCodeInputProps) {
  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];

  const handleDigitChange = (index: number, digit: string) => {
    if (isLoading) return;
    if (!/^\d?$/.test(digit)) return;

    const current = value.padEnd(maxLength, ' ').split('');
    current[index] = digit || '';
    const nextValue = current.join('').replace(/\s+/g, '').slice(0, maxLength);
    onChange(nextValue);

    if (digit && index < maxLength - 1) {
      inputRefs[index + 1].current?.focus();
    }

    if (nextValue.length === maxLength) {
      onSubmit(nextValue);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLoading) {
      e.preventDefault();
      return;
    }
    if (e.key === 'Backspace') {
      if (index > 0 && !value[index]) {
        inputRefs[index - 1].current?.focus();
      }
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    if (isLoading) return;
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    if (!pasted) return;
    const digits = pasted.replace(/\D/g, '').slice(0, maxLength);
    if (!digits) return;
    onChange(digits);
    if (digits.length === maxLength) {
      inputRefs[maxLength - 1]?.current?.focus();
      onSubmit(digits);
    } else {
      inputRefs[digits.length]?.current?.focus();
    }
  };

  const handleBeforeInput = (
    index: number,
    e: React.FormEvent<HTMLInputElement>
  ) => {
    if (isLoading) return;
    const native = e.nativeEvent as unknown as { data?: string; inputType?: string };
    const incoming = native?.data ?? '';
    const inputType = native?.inputType ?? '';

    const isBulkInsert =
      (incoming && incoming.length > 1) ||
      inputType === 'insertFromPaste' ||
      inputType === 'insertReplacementText';

    if (!isBulkInsert) return;

    const digits = (incoming || '').replace(/\D/g, '').slice(0, maxLength);
    if (!digits) return;

    e.preventDefault();
    onChange(digits);
    if (digits.length === maxLength) {
      inputRefs[maxLength - 1]?.current?.focus();
      onSubmit(digits);
    } else {
      inputRefs[digits.length]?.current?.focus();
    }
  };

  const buttonStyles = {
    primary: "bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500",
    danger: "bg-red-600 hover:bg-red-500 focus:ring-red-500"
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (value.length === maxLength && !isLoading) onSubmit(value);
      }}
      className="space-y-4"
    >
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div className="flex justify-center space-x-2 sm:space-x-4">
        {[...Array(maxLength)].map((_, index) => (
          <input
            key={index}
            ref={inputRefs[index]}
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={1}
            autoFocus={autoFocus && index === 0}
            autoComplete="one-time-code"
            className="w-10 h-12 sm:w-12 sm:h-14 text-center text-2xl font-bold rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 disabled:opacity-50"
            value={value[index] || ''}
            onChange={(e) => handleDigitChange(index, e.target.value)}
            onKeyDown={(e) => handleKeyDown(index, e)}
            onBeforeInput={(e) => handleBeforeInput(index, e)}
            onPaste={handlePaste}
            readOnly={isLoading}
            disabled={isLoading}
          />
        ))}
      </div>

      <button
        type="submit"
        disabled={isLoading || value.length !== maxLength}
        className={`w-full px-4 py-3 rounded-xl text-white font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed ${buttonStyles[submitButtonVariant]}`}
      >
        {isLoading ? submitButtonLoadingText : submitButtonText}
      </button>
    </form>
  );
} 