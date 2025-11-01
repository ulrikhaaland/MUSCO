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
 * Template questions shown when no body part is selected
 */
export const GLOBAL_TEMPLATE_QUESTIONS: TemplateQuestion[] = [
  {
    label: 'What can you help me with?',
    question: 'What can you help me with?',
    chatMode: 'explore',
    title: '',
    description: 'Learn about the assistant capabilities',
  },
  {
    label: 'I have pain',
    question: 'I have pain',
    chatMode: 'diagnosis',
    title: '',
    description: 'Start a pain assessment',
  },
  {
    label: 'Build an exercise program',
    question: 'Build an exercise program',
    chatMode: 'explore',
    title: '',
    description: 'Create a customized training plan',
  },
];

/**
 * Template questions shown when a body part is selected
 * Can be filtered/customized based on selected body part
 */
export const BODY_PART_TEMPLATE_QUESTIONS: TemplateQuestion[] = [
  {
    label: 'I have pain here',
    question: 'I have pain in this area',
    chatMode: 'diagnosis',
    title: '',
    description: 'Start assessment for selected body part',
  },
  {
    label: 'Show me exercises',
    question: 'What exercises can help strengthen this area?',
    chatMode: 'explore',
    title: '',
    description: 'Get exercise recommendations',
  },
  {
    label: 'Build a program',
    question: 'Create a training program for this area',
    chatMode: 'explore',
    title: '',
    description: 'Generate customized program',
  },
];

