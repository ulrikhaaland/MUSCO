import React, { useEffect } from 'react';
import { renderHook } from '@testing-library/react';
import { usePartChat } from '../usePartChat';

// Mock dependencies
jest.mock('../../i18n', () => ({
  useTranslation: () => ({ t: (k: string) => k }),
}));

jest.mock('../../utils/bodyPartTranslation', () => ({
  translateBodyPartGroupName: (g: any) => (g?.name || 'test-group'),
  translatePartDirectionPrefix: (p: any) => (p?.name || 'test-part'),
}));

jest.mock('../../context/AppContext', () => ({
  useApp: () => ({ intention: 'None' }),
  ProgramIntention: { None: 'None' },
}));

jest.mock('../../config/templateQuestions', () => ({
  getPartSpecificTemplateQuestions: () => [],
}));

// Mock useChat with body part selection support
const mockSendChatMessage = jest.fn();
const mockAssistantResponse = {
  selectedBodyGroup: null,
  selectedBodyPart: null,
};

jest.mock('../useChat', () => ({
  useChat: () => ({
    messages: [],
    isLoading: false,
    rateLimited: false,
    userPreferences: undefined,
    followUpQuestions: [],
    exerciseResults: [],
    inlineExercises: new Map(),
    resetChat: jest.fn(),
    sendChatMessage: mockSendChatMessage,
    assistantResponse: mockAssistantResponse,
    streamError: null,
    messagesRef: { current: null },
  }),
}));

describe('usePartChat - Body Part Selection', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAssistantResponse.selectedBodyGroup = null;
    mockAssistantResponse.selectedBodyPart = null;
  });

  it('should call onBodyGroupSelected when assistant selects a body group', () => {
    const onBodyGroupSelected = jest.fn();
    
    const { rerender } = renderHook(() =>
      usePartChat({
        selectedPart: null,
        selectedGroups: [],
        onBodyGroupSelected,
      })
    );

    // Simulate assistant selecting a body group
    mockAssistantResponse.selectedBodyGroup = 'Back';
    
    rerender();

    expect(onBodyGroupSelected).toHaveBeenCalledWith('Back');
  });

  it('should call onBodyPartSelected when assistant selects a specific body part', () => {
    const onBodyPartSelected = jest.fn();
    
    const { rerender } = renderHook(() =>
      usePartChat({
        selectedPart: null,
        selectedGroups: [],
        onBodyPartSelected,
      })
    );

    // Simulate assistant selecting a specific part
    mockAssistantResponse.selectedBodyPart = 'Lower back';
    
    rerender();

    expect(onBodyPartSelected).toHaveBeenCalledWith('Lower back');
  });

  it('should not call onBodyGroupSelected if group is already selected', () => {
    const onBodyGroupSelected = jest.fn();
    
    const { rerender } = renderHook(() =>
      usePartChat({
        selectedPart: null,
        selectedGroups: [{ id: 'back', name: 'Back', parts: [] } as any],
        onBodyGroupSelected,
      })
    );

    // Simulate assistant selecting a body group
    mockAssistantResponse.selectedBodyGroup = 'Back';
    
    rerender();

    // Should not be called because a group is already selected
    expect(onBodyGroupSelected).not.toHaveBeenCalled();
  });

  it('should not call onBodyPartSelected if part is already selected', () => {
    const onBodyPartSelected = jest.fn();
    
    const { rerender } = renderHook(() =>
      usePartChat({
        selectedPart: { name: 'Lower back' } as any,
        selectedGroups: [],
        onBodyPartSelected,
      })
    );

    // Simulate assistant selecting a specific part
    mockAssistantResponse.selectedBodyPart = 'Lower back';
    
    rerender();

    // Should not be called because a part is already selected
    expect(onBodyPartSelected).not.toHaveBeenCalled();
  });

  it('should handle missing callbacks gracefully', () => {
    const { rerender } = renderHook(() =>
      usePartChat({
        selectedPart: null,
        selectedGroups: [],
        // No callbacks provided
      })
    );

    // Simulate assistant selections
    mockAssistantResponse.selectedBodyGroup = 'Back';
    mockAssistantResponse.selectedBodyPart = 'Lower back';
    
    // Should not throw
    expect(() => rerender()).not.toThrow();
  });
});

