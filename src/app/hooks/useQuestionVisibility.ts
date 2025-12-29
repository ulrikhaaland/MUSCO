import { useCallback, useEffect, useRef, useState } from 'react';
import { Question } from '@/app/types';

/**
 * Hook for managing staggered visibility of follow-up questions.
 * Handles animation timing and auto-scroll when new questions appear.
 */
interface UseQuestionVisibilityOptions {
  /** Array of questions to display */
  questions: Question[];
  /** Whether auto-scroll is disabled */
  disableAutoScroll?: boolean;
  /** Function to scroll to bottom when questions appear */
  scrollToBottom?: () => void;
  /** Whether the user has touched/scrolled (prevents auto-scroll) */
  userTouched?: boolean;
}

interface UseQuestionVisibilityReturn {
  /** Set of question IDs that are currently visible */
  visibleQuestions: Set<string>;
}

export function useQuestionVisibility({
  questions,
  disableAutoScroll = false,
  scrollToBottom,
  userTouched = false,
}: UseQuestionVisibilityOptions): UseQuestionVisibilityReturn {
  const [visibleQuestions, setVisibleQuestions] = useState<Set<string>>(new Set());
  const followUpQuestionsRef = useRef<Question[]>([]);
  const followUpObserverRef = useRef<MutationObserver | null>(null);
  const touchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hasHadTouchRef = useRef<boolean>(false);
  const staggerTimeoutsRef = useRef<NodeJS.Timeout[]>([]);
  // Track which questions already have pending timeouts to avoid duplicate scheduling
  const pendingQuestionsRef = useRef<Set<string>>(new Set());

  // Function to ensure follow-up questions are visible
  const ensureFollowUpQuestionsVisible = useCallback(() => {
    // Skip auto-scrolling if disabled
    if (disableAutoScroll) return;

    // Don't scroll if user has explicitly scrolled away
    if (userTouched) return;

    // Clear touch state to allow auto-scrolling
    hasHadTouchRef.current = false;

    // Clear any existing touch timeout to prevent unexpected resets
    if (touchTimeoutRef.current) {
      clearTimeout(touchTimeoutRef.current);
      touchTimeoutRef.current = null;
    }

    // First try to locate and scroll to the follow-up questions container
    const followUpsContainer = document.querySelector('.space-y-2');
    if (followUpsContainer) {
      // Try to make follow-ups visible by directly scrolling to them
      try {
        followUpsContainer.scrollIntoView({ behavior: 'smooth', block: 'end' });
      } catch {
        // Fallback to general scrollToBottom if direct scroll fails
        if (scrollToBottom) {
          setTimeout(scrollToBottom, 50);
        }
      }
    } else if (scrollToBottom) {
      // If container not found, use regular scroll to bottom
      scrollToBottom();
    }

    // Additional attempt after a delay to ensure visibility
    if (scrollToBottom) {
      setTimeout(scrollToBottom, 250);
    }
  }, [userTouched, disableAutoScroll, scrollToBottom]);

  useEffect(() => {
    // Skip empty arrays - reset all state
    if (questions.length === 0) {
      followUpQuestionsRef.current = [];
      setVisibleQuestions(new Set());
      // Clear pending timeouts when resetting
      staggerTimeoutsRef.current.forEach(clearTimeout);
      staggerTimeoutsRef.current = [];
      pendingQuestionsRef.current.clear();
      return;
    }

    // Skip auto-scrolling if disabled
    if (disableAutoScroll) {
      followUpQuestionsRef.current = [...questions];
      // Show all questions immediately if auto-scroll is disabled
      const allQuestionIds = new Set(
        questions.map((q) => q.title || q.question)
      );
      setVisibleQuestions(allQuestionIds);
      return;
    }

    // Deep check if questions have changed (not just count)
    const getQId = (q: Question) => q.title || q.question;

    // Detect if any truly new question (by id) arrived
    const hasNewQuestions = questions.some((newQ) => {
      const newId = getQId(newQ);
      return !followUpQuestionsRef.current.some(
        (oldQ) => getQId(oldQ) === newId
      );
    });

    // Show new questions with staggered timing for animation effect
    if (hasNewQuestions) {
      const prevIds = new Set(followUpQuestionsRef.current.map((q) => getQId(q)));
      const newQuestions = questions.filter((q) => !prevIds.has(getQId(q)));

      // Only schedule timeouts for questions that don't already have pending timeouts
      // pendingQuestionsRef tracks both pending AND already-visible questions to prevent duplicates
      const questionsToSchedule = newQuestions.filter((q) => {
        const qId = getQId(q);
        return !pendingQuestionsRef.current.has(qId);
      });

      // Stagger the visibility of each new question
      questionsToSchedule.forEach((question, index) => {
        const questionId = question.title || question.question;
        // Mark as pending
        pendingQuestionsRef.current.add(questionId);
        
        const timeoutId = setTimeout(() => {
          setVisibleQuestions((prev) => {
            const updated = new Set(prev);
            updated.add(questionId);
            return updated;
          });
          // Remove from pending once visible
          pendingQuestionsRef.current.delete(questionId);
        }, index * 80); // 80ms delay between each question appearing
        staggerTimeoutsRef.current.push(timeoutId);
      });
    }

    // Always scroll when follow-up questions appear or change unless user has explicitly scrolled
    if (hasNewQuestions) {
      // Disconnect any existing observer
      if (followUpObserverRef.current) {
        followUpObserverRef.current.disconnect();
        followUpObserverRef.current = null;
      }

      // Set up a mutation observer to detect when follow-up questions are fully rendered
      const targetNode = document.querySelector('.space-y-2');
      if (targetNode) {
        // Initial attempt to scroll
        ensureFollowUpQuestionsVisible();

        // Create an observer to watch for DOM changes in the follow-up questions area
        followUpObserverRef.current = new MutationObserver(() => {
          // When DOM changes detected, ensure questions are visible
          ensureFollowUpQuestionsVisible();

          // Disconnect after a certain time to avoid infinite loops
          setTimeout(() => {
            if (followUpObserverRef.current) {
              followUpObserverRef.current.disconnect();
              followUpObserverRef.current = null;
            }
          }, 1000);
        });

        // Start observing
        followUpObserverRef.current.observe(targetNode, {
          childList: true,
          subtree: true,
          attributes: true,
        });

        // Backup plan: try scrolling again after a delay
        setTimeout(ensureFollowUpQuestionsVisible, 500);
      } else {
        // If we can't find the container yet, try a few times with delay
        setTimeout(ensureFollowUpQuestionsVisible, 100);
        setTimeout(ensureFollowUpQuestionsVisible, 300);
        setTimeout(ensureFollowUpQuestionsVisible, 600);
      }
    }

    // Update reference for next comparison
    followUpQuestionsRef.current = [...questions];

    // Clean up observer when questions change
    return () => {
      if (followUpObserverRef.current) {
        followUpObserverRef.current.disconnect();
        followUpObserverRef.current = null;
      }
      // Note: Don't clear stagger timeouts on question changes - they should complete
    };
  }, [questions, ensureFollowUpQuestionsVisible, disableAutoScroll]);

  // Cleanup all timeouts on unmount only
  useEffect(() => {
    return () => {
      staggerTimeoutsRef.current.forEach(clearTimeout);
      staggerTimeoutsRef.current = [];
      pendingQuestionsRef.current.clear();
    };
  }, []);

  return {
    visibleQuestions,
  };
}


