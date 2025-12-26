'use client';

import { useTranslation } from '@/app/i18n/TranslationContext';
import { ProgramType } from '../../../../shared/types';

interface WeeklyLimitModalProps {
  isOpen: boolean;
  programType: ProgramType;
  nextAllowedDate: Date;
  onClose: () => void;
}

export function WeeklyLimitModal({
  isOpen,
  programType,
  nextAllowedDate,
  onClose,
}: WeeklyLimitModalProps) {
  const { t, locale } = useTranslation();

  if (!isOpen) return null;

  const programTypeLabel = t(`weeklyLimit.programType.${programType}`);
  const formattedDate = nextAllowedDate.toLocaleDateString(
    locale === 'nb' ? 'nb-NO' : 'en-US',
    {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    }
  );

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="max-w-md w-full bg-gray-900 rounded-2xl p-6 shadow-xl border border-gray-700"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/20 flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-white text-center mb-2">
          {t('weeklyLimit.title')}
        </h2>

        {/* Message */}
        <p className="text-gray-300 text-center mb-2">
          {t('weeklyLimit.message').replace('{{programType}}', programTypeLabel)}
        </p>

        {/* Next allowed date */}
        <p className="text-gray-400 text-center text-sm mb-6">
          {t('weeklyLimit.nextAllowed').replace('{{date}}', formattedDate)}
        </p>

        {/* Dismiss button */}
        <button
          onClick={onClose}
          className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg transition-colors"
        >
          {t('weeklyLimit.dismiss')}
        </button>
      </div>
    </div>
  );
}



