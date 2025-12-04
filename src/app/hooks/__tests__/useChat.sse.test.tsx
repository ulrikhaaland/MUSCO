import React, { useEffect } from 'react';
import { render, waitFor } from '@testing-library/react';
import { useChat } from '../useChat';

// Mocks
const sendMessageMock = jest.fn();
const getOrCreateAssistantMock = jest.fn().mockResolvedValue({ assistantId: 'aid', threadId: 'tid-1' });
const createThreadMock = jest.fn().mockResolvedValue({ threadId: 'tid-2' });

jest.mock('../../api/assistant/assistant', () => ({
  getOrCreateAssistant: (...args: any[]) => getOrCreateAssistantMock(...args),
  createThread: (...args: any[]) => createThreadMock(...args),
  sendMessage: (...args: any[]) => sendMessageMock(...args),
}));

jest.mock('../../context/AuthContext', () => ({
  useAuth: () => ({ user: null }),
}));

const appSpies = {
  saveSpy: jest.fn(),
  restoreSpy: jest.fn(),
  clearSpy: jest.fn(),
};

jest.mock('../../context/AppContext', () => ({
  useApp: () => ({
    saveChatState: appSpies.saveSpy,
    restoreChatState: appSpies.restoreSpy,
    clearChatState: appSpies.clearSpy,
  }),
}));

jest.mock('../../i18n', () => ({
  useTranslation: () => ({ locale: 'en', t: (k: string) => k }),
}));

function Harness({ onReady }: { onReady: (api: ReturnType<typeof useChat>) => void }) {
  const api = useChat();
  useEffect(() => { onReady(api); }, [api, onReady]);
  return null;
}

describe.skip('useChat SSE and flow', () => {
  const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  beforeEach(() => {
    sendMessageMock.mockReset();
    getOrCreateAssistantMock.mockClear();
    createThreadMock.mockClear();
    appSpies.saveSpy.mockReset();
    appSpies.restoreSpy.mockReset();
    appSpies.clearSpy.mockReset();
    // reset session storage
    window.sessionStorage.clear();
  });
  afterAll(() => {
    errSpy.mockRestore();
    warnSpy.mockRestore();
    logSpy.mockRestore();
  });

  it('sets rateLimited on free_limit_exceeded and persists flag', async () => {
    sendMessageMock.mockImplementation(async (_tid, _payload, onChunk) => {
      onChunk('', { error: 'free_limit_exceeded' });
    });

    let api: ReturnType<typeof useChat> | undefined;
    render(<Harness onReady={(h) => (api = h)} />);

    await waitFor(async () => {
      await api!.sendChatMessage('hi', { mode: 'explore' } as any);
    });

    expect(api!.rateLimited).toBe(true);
    expect(api!.isLoading).toBe(false);
    expect(window.sessionStorage.getItem('rateLimited')).toBe('1');
  });

  it('sets streamError on stream_error and adds assistant error bubble', async () => {
    sendMessageMock.mockImplementation(async (_tid, _payload, onChunk) => {
      onChunk('', { error: 'stream_error' });
    });

    let api: ReturnType<typeof useChat> | undefined;
    render(<Harness onReady={(h) => (api = h)} />);

    await waitFor(async () => {
      await api!.sendChatMessage('hi', { mode: 'explore' } as any);
    });

    expect(api!.streamError).toBeInstanceOf(Error);
    // Last message should be assistant with hasError
    const last = api!.messages[api!.messages.length - 1];
    expect(last.role).toBe('assistant');
    expect((last as any).hasError).toBe(true);
  });

  it('queues messages while loading and preserves order', async () => {
    let resolveFirst: (() => void) | undefined;
    sendMessageMock
      .mockImplementationOnce(() => new Promise<void>((res) => { resolveFirst = res; }))
      .mockImplementationOnce(async () => {});

    let api: ReturnType<typeof useChat> | undefined;
    render(<Harness onReady={(h) => (api = h)} />);

    await waitFor(async () => {
      const p1 = api!.sendChatMessage('first', { mode: 'explore' } as any);
      const p2 = api!.sendChatMessage('second', { mode: 'explore' } as any);
      resolveFirst!();
      await p1;
      await p2;
    });

    expect(api!.messages.filter((m) => m.role === 'user').map((m) => m.content)).toEqual(['first', 'second']);
  });

  it('resetChat clears state and next send uses null previousTurnAssistantResponse', async () => {
    // First call: emit structured events to set assistantResponse
    sendMessageMock
      .mockImplementationOnce(async (_tid, _payload, onChunk) => {
        onChunk('Some text', { type: 'assistant_response', response: { diagnosis: null, followUpQuestions: [] } });
      })
      .mockImplementationOnce(async (_tid, payload) => {
        // Capture payload for assertion
        (sendMessageMock as any).lastPayload = payload;
      });

    let api: ReturnType<typeof useChat> | undefined;
    render(<Harness onReady={(h) => (api = h)} />);

    await waitFor(async () => {
      await api!.sendChatMessage('hi', { mode: 'explore' } as any);
    });

    expect(api!.assistantResponse).not.toBeNull();

    act(() => {
      api!.resetChat();
    });

    await waitFor(async () => {
      await api!.sendChatMessage('again', { mode: 'explore' } as any);
    });

    const lastPayload = (sendMessageMock as any).lastPayload;
    expect(lastPayload.diagnosisAssistantResponse).toBeNull();
    expect(createThreadMock).toHaveBeenCalled();
  });

  it('persists state via saveChatState and hydrates from restoreChatState', async () => {
    // Hydrate snapshot on mount
    appSpies.restoreSpy.mockReturnValue({
      messages: [{ id: 'm1', role: 'assistant', content: 'hello', timestamp: new Date() }],
      followUpQuestions: [],
      assistantResponse: null,
    });
    sendMessageMock.mockImplementation(async () => {});

    let api: ReturnType<typeof useChat> | undefined;
    render(<Harness onReady={(h) => (api = h)} />);

    // saveChatState should be called after any material change; trigger a send
    await waitFor(async () => {
      await api!.sendChatMessage('user', { mode: 'explore' } as any);
    });

    expect(appSpies.saveSpy).toHaveBeenCalled();
    expect(appSpies.restoreSpy).toHaveBeenCalled();
  });

  it('receives clean text from backend (backend strips markers)', async () => {
    sendMessageMock.mockImplementation(async (_tid, _payload, onChunk) => {
      // Backend now sends structured events with clean text
      onChunk('Lead', undefined);
      onChunk('', { type: 'assistant_response', response: { diagnosis: null, followUpQuestions: [] } });
    });

    let api: ReturnType<typeof useChat> | undefined;
    render(<Harness onReady={(h) => (api = h)} />);

    await waitFor(async () => {
      await api!.sendChatMessage('go', { mode: 'explore' } as any);
    });

    const assistant = api!.messages.find((m) => m.role === 'assistant');
    expect(assistant?.content).toBe('Lead');
  });

  it('retryLastMessage removes prior error bubble and resends payload', async () => {
    // First send throws to set lastSendError and add an assistant error bubble
    sendMessageMock
      .mockImplementationOnce(async () => { throw new Error('boom'); })
      .mockImplementationOnce(async () => {});

    let api: ReturnType<typeof useChat> | undefined;
    render(<Harness onReady={(h) => (api = h)} />);

    await waitFor(async () => {
      await api!.sendChatMessage('user-msg', { mode: 'explore' } as any);
    });

    // Assistant error bubble present
    const lastBefore = api!.messages[api!.messages.length - 1];
    expect(lastBefore.role).toBe('assistant');
    expect((lastBefore as any).hasError).toBe(true);

    await waitFor(async () => {
      api!.retryLastMessage();
      await Promise.resolve();
    });

    // No assistant error bubble remains anywhere
    const anyAssistantError = api!.messages.some((m: any) => m.role === 'assistant' && m.hasError === true);
    expect(anyAssistantError).toBe(false);
    // send called twice
    expect(sendMessageMock).toHaveBeenCalledTimes(2);
  });

  it('visibility change triggers single refetch when interrupted', async () => {
    jest.useFakeTimers();
    let resolveSecond: (() => void) | undefined;
    // First call never resolves or enqueues chunks to keep interruption flag true
    sendMessageMock
      .mockImplementationOnce(() => new Promise<void>(() => {}))
      .mockImplementationOnce(() => new Promise<void>((res) => { resolveSecond = res; }));

    let api: ReturnType<typeof useChat> | undefined;
    render(<Harness onReady={(h) => (api = h)} />);

    // Kick off a send; it will hang
    act(() => {
      void api!.sendChatMessage('hang', { mode: 'explore' } as any);
    });

    // Simulate tab hidden then visible
    Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));
    Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
    document.dispatchEvent(new Event('visibilitychange'));

    // Advance timers to trigger delayed refetch (1s)
    jest.advanceTimersByTime(1100);

    // Allow the refetch send to resolve
    if (resolveSecond) resolveSecond();

    // Expect two send attempts: initial + refetch
    expect(sendMessageMock.mock.calls.length).toBeGreaterThanOrEqual(2);
    jest.useRealTimers();
  });

  it('queues three rapid sends and processes them in order', async () => {
    let resolveFirst: (() => void) | undefined;
    let resolveSecond: (() => void) | undefined;
    sendMessageMock
      .mockImplementationOnce(() => new Promise<void>((res) => { resolveFirst = res; }))
      .mockImplementationOnce(() => new Promise<void>((res) => { resolveSecond = res; }))
      .mockImplementationOnce(async () => {});

    let api: ReturnType<typeof useChat> | undefined;
    render(<Harness onReady={(h) => (api = h)} />);

    await waitFor(async () => {
      const p1 = api!.sendChatMessage('first', { mode: 'explore' } as any);
      const p2 = api!.sendChatMessage('second', { mode: 'explore' } as any);
      const p3 = api!.sendChatMessage('third', { mode: 'explore' } as any);
      resolveFirst!();
      await p1;
      resolveSecond!();
      await p2;
      await p3;
    });

    const userMessages = api!.messages.filter((m) => m.role === 'user').map((m) => m.content);
    expect(userMessages).toEqual(['first', 'second', 'third']);
  });
});


