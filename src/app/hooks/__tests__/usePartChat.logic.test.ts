import { decideMode, type ModeDecisionInput, type ModeDecisionOutput } from '../logic/partChatDecision';

describe('usePartChat.decideMode (pure)', () => {
  const run = (over: Partial<ModeDecisionInput>): ModeDecisionOutput => {
    const base: ModeDecisionInput = {
      forceMode: undefined,
      rawMode: undefined,
      currentChatMode: 'diagnosis',
      messagesLength: 0,
      questionTitle: '',
      questionHasChatMode: false,
      questionGenerate: false,
    };
    return decideMode({ ...base, ...over });
  };

  it('uses forceMode when provided', () => {
    const out = run({ forceMode: 'explore', rawMode: 'diagnosis', currentChatMode: 'diagnosis' });
    expect(out.nextMode).toBe('explore');
    expect(out.modeForPayload).toBe('explore');
    expect(out.deferRouter).toBe(false);
  });

  it('uses raw chatMode when provided and no force', () => {
    const out = run({ rawMode: 'diagnosis', currentChatMode: 'explore' });
    expect(out.nextMode).toBe('diagnosis');
    expect(out.modeForPayload).toBe('diagnosis');
  });

  it('defers router for first typed message (no title, no chatMode, no generate, messages=0)', () => {
    const out = run({ currentChatMode: 'explore', messagesLength: 0, questionTitle: '', questionHasChatMode: false, questionGenerate: false });
    expect(out.deferRouter).toBe(true);
    expect(out.modeForPayload).toBeUndefined();
  });

  it('does not defer when there is a title (predefined option)', () => {
    const out = run({ questionTitle: 'Pick a thing', messagesLength: 0 });
    expect(out.deferRouter).toBe(false);
    expect(out.modeForPayload).toBe('diagnosis');
  });

  it('does not defer when chatMode present in question', () => {
    const out = run({ questionHasChatMode: true, messagesLength: 0, questionTitle: '' });
    expect(out.deferRouter).toBe(false);
    expect(out.modeForPayload).toBe('diagnosis');
  });

  it('does not defer when not first message (messages > 0)', () => {
    const out = run({ messagesLength: 1, questionTitle: '' });
    expect(out.deferRouter).toBe(false);
  });
});


