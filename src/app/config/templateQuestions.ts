/**
 * Centralized template questions for chat interface
 * These appear as quick-start buttons when no conversation is active
 */

import { Question } from '@/app/types';

export interface TemplateQuestion extends Question {
  /** Display label for the button */
  label: string;
  /** Question text to send to the assistant */
  question: string;
  /** Chat mode - explicitly set to bypass router */
  chatMode: 'explore' | 'diagnosis';
  /** Optional description for tooltip or accessibility */
  description?: string;
}

/**
 * Get template questions with translations applied
 * @param t - Translation function from useTranslation hook
 */
export function getGlobalTemplateQuestions(t: (key: string) => string): TemplateQuestion[] {
  return [
    {
      label: t('chat.template.whatCanYouHelp.label'),
      question: t('chat.template.whatCanYouHelp.question'),
      chatMode: 'explore',
      title: '',
      description: t('chat.template.whatCanYouHelp.description'),
    },
    {
      label: t('chat.template.havePain.label'),
      question: t('chat.template.havePain.question'),
      chatMode: 'diagnosis',
      title: '',
      description: t('chat.template.havePain.description'),
    },
    {
      label: t('chat.template.buildProgram.label'),
      question: t('chat.template.buildProgram.question'),
      chatMode: 'explore',
      title: '',
      description: t('chat.template.buildProgram.description'),
    },
  ];
}

/**
 * Template questions shown when a body part is selected
 * Can be filtered/customized based on selected body part
 * @param t - Translation function from useTranslation hook
 */
export function getBodyPartTemplateQuestions(t: (key: string) => string): TemplateQuestion[] {
  return [
    {
      label: t('chat.question.painSource.title'),
      question: 'I have pain in this area',
      chatMode: 'diagnosis',
      title: '',
      description: t('chat.question.painSource.meta'),
    },
    {
      label: t('chat.question.explore.title'),
      question: 'What exercises can help strengthen this area?',
      chatMode: 'explore',
      title: '',
      description: t('chat.question.explore.meta'),
    },
    {
      label: t('chat.question.exercise.title'),
      question: 'Create a training program for this area',
      chatMode: 'explore',
      title: '',
      description: t('chat.question.exercise.meta'),
    },
  ];
}

