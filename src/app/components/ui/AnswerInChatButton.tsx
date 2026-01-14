'use client';

import { useTranslation } from '@/app/i18n';

interface AnswerInChatButtonProps {
  onClick: () => void;
  className?: string;
}

export function AnswerInChatButton({ onClick, className = '' }: AnswerInChatButtonProps) {
  const { t } = useTranslation();
  
  return (
    <div className={`mt-4 ${className}`}>
      <button
        onClick={onClick}
        className="follow-up-question-btn w-full min-h-[48px] text-left px-4 py-3 pb-4 rounded-lg cursor-pointer
          bg-[rgba(99,91,255,0.12)] border border-[rgba(99,91,255,0.35)] text-[#c8cbff] font-medium
          hover:border-[rgba(99,91,255,0.5)] focus:border-[rgba(99,91,255,0.5)] active:border-[rgba(99,91,255,0.5)]
          hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] focus:shadow-[0_4px_12px_rgba(0,0,0,0.25)] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
          hover:bg-gradient-to-r hover:from-indigo-900/80 hover:to-indigo-800/80
          hover:-translate-y-[2px] active:-translate-y-[2px] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
          group transition-all duration-300 ease-out
          motion-safe:hover:-translate-y-[2px] motion-safe:active:scale-[0.99]"
      >
        <div className="flex items-center">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="mr-2 text-[#635bff] transform transition-transform duration-[90ms] group-hover:translate-x-[6px]"
          >
            <path
              d="M7 17L17 7M17 7H7M17 7V17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <div className="flex-1">
            <div className="font-medium text-[#c8cbff]">{t('feedback.answerInChat')}</div>
            <div className="text-sm text-gray-400">{t('feedback.typeYourAnswer')}</div>
          </div>
        </div>
      </button>
    </div>
  );
}
