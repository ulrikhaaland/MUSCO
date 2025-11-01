/**
 * Centralized template questions for chat interface
 * These appear as quick-start buttons when no conversation is active
 */

import { Question } from '@/app/types';
import { ProgramType } from '@/../shared/types';

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
 * Get part-specific template questions (when a body part is selected)
 * @param name - Body part name (will replace $part placeholder)
 * @param intention - Program intention ('recovery' or other)
 * @param t - Translation function from useTranslation hook
 */
export function getPartSpecificTemplateQuestions(
  name: string,
  intention: string | undefined,
  t: (key: string) => string
): Question[] {
  const questions: Question[] = [
    {
      title: t('chat.question.painSource.title'),
      question: t('chat.question.painSource.text'),
      asked: false,
      meta: t('chat.question.painSource.meta'),
      chatMode: 'diagnosis',
    },
    {
      title: t('chat.question.explore.title'),
      question: t('chat.question.explore.text'),
      asked: false,
      meta: t('chat.question.explore.meta'),
      chatMode: 'explore',
    },
    {
      title: t('chat.question.exercise.title'),
      question: t('chat.question.exercise.text'),
      asked: false,
      generate: true,
      diagnosis: '',
      programType: ProgramType.Exercise,
      meta: t('chat.question.exercise.meta'),
    },
  ];

  // Replace Exercise program question with Recovery program when intention is recovery
  return questions.map(q => {
    const question = {...q};
    
    if (question.title === t('chat.question.exercise.title') && intention === 'recovery') {
      question.title = t('chat.question.recovery.title');
      question.question = t('chat.question.recovery.text');
      question.programType = ProgramType.Recovery;
      question.meta = t('chat.question.recovery.meta');
    }
    
    // Replace $part placeholder with the part name
    return {
      ...question,
      question: question.question.replace('$part', name.toLowerCase()),
      meta: question.meta?.replace('$part', name.toLowerCase()),
    };
  });
}

/**
 * @deprecated Use getPartSpecificTemplateQuestions instead
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

