'use client';

import { useState } from 'react';

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
  placeholder = "Enter 6-digit code",
  submitButtonText = "Submit",
  submitButtonLoadingText = "Processing...",
  submitButtonVariant = 'primary',
  maxLength = 6,
  autoFocus = true,
}: VerificationCodeInputProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/\D/g, ''); // Only allow digits
    if (inputValue.length <= maxLength) {
      onChange(inputValue);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.length === maxLength && !isLoading) {
      onSubmit(value);
    }
  };

  const buttonStyles = {
    primary: "bg-indigo-600 hover:bg-indigo-500 focus:ring-indigo-500",
    danger: "bg-red-600 hover:bg-red-500 focus:ring-red-500"
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-900/50 border border-red-500 rounded-lg p-3">
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )}

      <div>
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          placeholder={placeholder}
          className="w-full px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          maxLength={maxLength}
          autoFocus={autoFocus}
        />
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