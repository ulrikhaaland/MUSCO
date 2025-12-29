'use client';

import { useState, useCallback } from 'react';
import { Question } from '@/app/types';
import { useTranslation } from '@/app/i18n';

/**
 * Strip {{Name}} body part markers from text for display
 */
export function stripBodyPartMarkers(text: string): string {
  return text.replace(/\{\{([^}]+)\}\}/g, '$1');
}

/**
 * Strip [[Name]] exercise markers from text for display
 */
export function stripExerciseMarkers(text: string): string {
  return text.replace(/\[\[([^\]]+)\]\]/g, '$1');
}

/**
 * Strip all markers (body parts and exercises) from text for display
 */
export function stripAllMarkers(text: string): string {
  return stripExerciseMarkers(stripBodyPartMarkers(text));
}

/**
 * Capitalize only the first character of a string
 */
function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

interface FollowUpQuestionsProps {
  questions: Question[];
  visibleQuestions: Set<string>;
  prefersReducedMotion: boolean;
  onQuestionClick: (question: Question) => void;
}

export function FollowUpQuestions({
  questions,
  visibleQuestions,
  prefersReducedMotion,
  onQuestionClick,
}: FollowUpQuestionsProps) {
  const { t } = useTranslation();
  
  // Track selected items for multi-select
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  // Check if any questions are multi-select
  const hasMultiSelect = questions.some(q => q.multiSelect);
  const multiSelectQuestions = questions.filter(q => q.multiSelect);
  const nonMultiSelectQuestions = questions.filter(q => !q.multiSelect);

  // Handle click on a question
  const handleClick = useCallback((question: Question) => {
    if (question.multiSelect) {
      // Toggle selection for multi-select items
      const itemId = question.value || question.title || question.question;
      setSelectedItems(prev => {
        const newSet = new Set(prev);
        if (newSet.has(itemId)) {
          newSet.delete(itemId);
        } else {
          newSet.add(itemId);
        }
        return newSet;
      });
    } else {
      // For non-multi-select, if there are selected items, send them all
      if (selectedItems.size > 0) {
        // Find the selected questions and combine their values
        const selectedQuestions = multiSelectQuestions.filter(q => 
          selectedItems.has(q.value || q.title || q.question)
        );
        const combinedQuestion: Question = {
          ...question,
          question: selectedQuestions.map(q => q.title || q.question).join(', '),
        };
        setSelectedItems(new Set()); // Clear selection
        onQuestionClick(combinedQuestion);
      } else {
        // No multi-select items selected, just send this question
        onQuestionClick(question);
      }
    }
  }, [selectedItems, multiSelectQuestions, onQuestionClick]);

  // Handle submit for multi-select
  const handleSubmitSelected = useCallback(() => {
    if (selectedItems.size === 0) return;
    
    const selectedQuestions = multiSelectQuestions.filter(q => 
      selectedItems.has(q.value || q.title || q.question)
    );
    const combinedQuestion: Question = {
      question: selectedQuestions.map(q => q.title || q.question).join(', '),
    };
    setSelectedItems(new Set());
    onQuestionClick(combinedQuestion);
  }, [selectedItems, multiSelectQuestions, onQuestionClick]);

  const renderQuestion = (question: Question, index: number) => {
    const questionId = question.title || question.question;
    const isVisible = visibleQuestions.has(questionId);
    const itemId = question.value || question.title || question.question;
    const isSelected = selectedItems.has(itemId);

    return (
      <button
        key={questionId}
        onClick={() => handleClick(question)}
        aria-label={questionId}
        aria-pressed={question.multiSelect ? isSelected : undefined}
        data-quick-reply
        role="button"
        className={`follow-up-question-btn w-full min-h-[48px] text-left px-4 py-3 pb-4 rounded-lg cursor-pointer
          ${isSelected 
            ? 'bg-[rgba(99,91,255,0.35)] border-[rgba(99,91,255,0.7)]' 
            : 'bg-[rgba(99,91,255,0.12)] border-[rgba(99,91,255,0.35)]'
          } border text-[#c8cbff] font-medium
          hover:border-[rgba(99,91,255,0.5)] focus:border-[rgba(99,91,255,0.5)] active:border-[rgba(99,91,255,0.5)]
          hover:shadow-[0_4px_12px_rgba(0,0,0,0.25)] focus:shadow-[0_4px_12px_rgba(0,0,0,0.25)] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
          hover:bg-gradient-to-r hover:from-indigo-900/80 hover:to-indigo-800/80
          hover:-translate-y-[2px] active:-translate-y-[2px] active:shadow-[0_4px_16px_rgba(0,0,0,0.3)]
          group transition-all duration-300 ease-out
          ${prefersReducedMotion ? '' : 'motion-safe:hover:-translate-y-[2px] motion-safe:active:scale-[0.99]'}
          ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
        style={{
          transitionDelay: isVisible ? `${index * 50}ms` : '0ms',
        }}
      >
        <div className="flex items-center">
          {question.multiSelect ? (
            // Checkbox for multi-select
            <div className={`mr-3 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors
              ${isSelected 
                ? 'bg-[#635bff] border-[#635bff]' 
                : 'border-[#635bff] bg-transparent'
              }`}
            >
              {isSelected && (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </div>
          ) : (
            // Arrow for regular questions
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`mr-2 text-[#635bff] transform transition-transform duration-[90ms] ${prefersReducedMotion ? '' : 'group-hover:translate-x-[6px]'}`}
            >
              <path
                d="M7 17L17 7M17 7H7M17 7V17"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
          <div className="flex-1">
            <div
              className={`${!question.title ? 'text-[#c8cbff]' : 'font-medium text-[#c8cbff]'}`}
            >
              {question.title
                ? capitalizeFirst(stripAllMarkers(question.title.toLowerCase()))
                : stripAllMarkers(question.question)}
            </div>
            {question.meta && (
              <div className="text-sm text-[#c8cbff] opacity-75 mt-1">
                {stripAllMarkers(question.meta)}
              </div>
            )}
            {/* Only show subtitle if it's meaningfully different from the title */}
            {question.title && !question.meta && !question.multiSelect && 
             (() => {
               const titleLower = stripAllMarkers(question.title.toLowerCase()).replace(/[^a-zæøå0-9]/g, '');
               const questionLower = stripAllMarkers(question.question.toLowerCase()).replace(/[^a-zæøå0-9]/g, '');
               // Hide if: same text, one contains the other, or >60% overlap
               const isSimilar = titleLower === questionLower ||
                 questionLower.includes(titleLower) ||
                 titleLower.includes(questionLower) ||
                 (titleLower.length > 3 && questionLower.startsWith(titleLower.slice(0, Math.floor(titleLower.length * 0.6))));
               return !isSimilar;
             })() && (
              <div className="text-sm text-gray-400">
                {stripAllMarkers(question.question)}
              </div>
            )}
          </div>
        </div>
      </button>
    );
  };

  return (
    <div className="space-y-[10px]">
      {/* Render multi-select questions first */}
      {multiSelectQuestions.map((question, index) => renderQuestion(question, index))}
      
      {/* Show submit button when items are selected */}
      {hasMultiSelect && selectedItems.size > 0 && (
        <button
          onClick={handleSubmitSelected}
          className="w-full min-h-[48px] px-4 py-3 rounded-lg cursor-pointer
            bg-[#635bff] text-white font-medium
            hover:bg-[#5249e0] active:bg-[#4338ca]
            transition-all duration-200"
        >
          {t('feedback.sendSelected', { count: String(selectedItems.size) })}
        </button>
      )}
      
      {/* Render non-multi-select questions */}
      {nonMultiSelectQuestions.map((question, index) => 
        renderQuestion(question, multiSelectQuestions.length + index)
      )}
    </div>
  );
}

