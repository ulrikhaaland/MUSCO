import React from 'react';
import { useTranslation } from '@/app/i18n/TranslationContext';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  error?: string | null;
  confirmButtonStyle?: 'danger' | 'primary';
  requiresTextConfirmation?: boolean;
  confirmationText?: string;
  userInput?: string;
  onInputChange?: (value: string) => void;
  inputPlaceholder?: string;
}

export default function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  isLoading = false,
  error = null,
  confirmButtonStyle = 'danger',
  requiresTextConfirmation = false,
  confirmationText = '',
  userInput = '',
  onInputChange,
  inputPlaceholder = ''
}: ConfirmationDialogProps) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm();
  };

  const isConfirmDisabled = isLoading || 
    (requiresTextConfirmation && userInput.toLowerCase() !== confirmationText.toLowerCase());

  const confirmButtonClass = confirmButtonStyle === 'danger' 
    ? 'bg-red-600 hover:bg-red-500' 
    : 'bg-indigo-600 hover:bg-indigo-500';

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-gray-800 p-6 rounded-lg max-w-md w-full m-4 shadow-2xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <p className="text-gray-300 mb-4">
          {description}
        </p>
        
        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 mb-4">
            <p className="text-red-300 text-sm">{error}</p>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          {requiresTextConfirmation && (
            <input
              type="text"
              value={userInput}
              onChange={(e) => onInputChange?.(e.target.value)}
              placeholder={inputPlaceholder}
              className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
            />
          )}
          
          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isConfirmDisabled}
              className={`px-4 py-2 text-white rounded-lg flex-1 ${confirmButtonClass} ${
                isConfirmDisabled ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isLoading ? t('common.loading') : (confirmText || t('common.confirm'))}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 text-white rounded-lg flex-1 hover:bg-gray-600"
            >
              {cancelText || t('common.cancel')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 