// Polyfills/mocks for Next server APIs before importing the route
import 'openai/shims/node';

// Mock env for OpenAI (required before importing explore-assistant)
process.env.OPENAI_API_KEY = 'test-key';

// Polyfills for Node environment
import { TextEncoder, TextDecoder } from 'util';
import * as nodeStream from 'stream/web';

if (!(global as any).TextEncoder) {
  (global as any).TextEncoder = TextEncoder;
}
if (!(global as any).TextDecoder) {
  (global as any).TextDecoder = TextDecoder;
}
if (!(global as any).ReadableStream) {
  (global as any).ReadableStream = nodeStream.ReadableStream;
}

// Minimal Response shim for test
class MockResponse {
  constructor(public body: any, public init?: any) {}
  get headers() {
    return new Map(Object.entries(this.init?.headers || {}));
  }
  get status() {
    return this.init?.status || 200;
  }
  async json() {
    return typeof this.body === 'string' ? JSON.parse(this.body) : this.body;
  }
}

if (!(global as any).Response) {
  (global as any).Response = MockResponse;
}

jest.mock('next/server', () => ({
  NextResponse: {
    json: (data: any, init?: any) => new (global as any).Response(JSON.stringify(data), { status: init?.status || 200, headers: init?.headers }),
  },
}));

// Mocks for next/headers cookies
jest.mock('next/headers', () => ({
  cookies: async () => ({
    get: () => undefined,
  }),
}));

// Mocks for server helpers used by send_message_chat
const helpers = {
  getChatCompletion: jest.fn(),
  streamChatCompletion: jest.fn(),
  reserveFreeChatTokens: jest.fn(),
  reserveFreeChatTokensForAnon: jest.fn(),
};

jest.mock('@/app/api/assistant/openai-server', () => ({
  getChatCompletion: (...args: any[]) => helpers.getChatCompletion(...args),
  streamChatCompletion: (...args: any[]) => helpers.streamChatCompletion(...args),
  reserveFreeChatTokens: (...args: any[]) => helpers.reserveFreeChatTokens(...args),
  reserveFreeChatTokensForAnon: (...args: any[]) => helpers.reserveFreeChatTokensForAnon(...args),
  // The rest are not used in these tests
  generateExerciseProgramWithModel: jest.fn(),
  generateFollowUpExerciseProgram: jest.fn(),
}));

// explore-assistant.ts removed - functionality unified in send_message_chat

import { POST } from '../route';
import { chatModeRouterPrompt } from '@/app/api/prompts/routePrompt';

describe('assistant route router behavior', () => {
  beforeEach(() => {
    jest.resetAllMocks();
  });

  it('runs router on first message without mode and logs router events', async () => {
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => undefined);

    // First call: router, return diagnosis
    helpers.getChatCompletion
      .mockResolvedValueOnce('{"chatMode":"diagnosis"}')
      // Second call: assistant reply text for non-streaming path
      .mockResolvedValueOnce('ok-reply');

    const req: any = {
      json: async () => ({
        action: 'send_message_chat',
        stream: false,
        payload: {
          message: 'hello',
          messages: [],
          language: 'en',
        },
      })
    };

    const res = await POST(req);
    const json = await (res as Response).json();
    expect(json).toHaveProperty('messages');

    // getChatCompletion called at least twice, first with router prompt
    expect(helpers.getChatCompletion).toHaveBeenCalled();
    const firstArgs = helpers.getChatCompletion.mock.calls[0][0];
    expect(firstArgs.systemMessage).toBe(chatModeRouterPrompt);

    // Logs include router_run, router_result, mode_use
    const logs = consoleInfo.mock.calls.map((c) => String(c[0]));
    expect(logs.some((l) => l.includes('event=router_run'))).toBe(true);
    expect(logs.some((l) => l.includes('event=router_result'))).toBe(true);
    expect(logs.some((l) => l.includes('event=mode_use value=diagnosis'))).toBe(true);

    consoleInfo.mockRestore();
  });

  it('skips router when mode is provided', async () => {
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => undefined);

    helpers.getChatCompletion.mockResolvedValueOnce('ok-reply');

    const req: any = {
      json: async () => ({
        action: 'send_message_chat',
        stream: false,
        payload: {
          message: 'hi',
          messages: [],
          mode: 'explore',
          language: 'en',
        },
      })
    };

    const res = await POST(req);
    expect(res).toBeInstanceOf(Response);

    const logs = consoleInfo.mock.calls.map((c) => String(c[0]));
    expect(logs.some((l) => l.includes('event=router_skip reason=has_mode'))).toBe(true);
    // Ensure router prompt was not used
    const routerCalls = helpers.getChatCompletion.mock.calls.filter((c) => c[0]?.systemMessage === chatModeRouterPrompt);
    expect(routerCalls.length).toBe(0);

    consoleInfo.mockRestore();
  });

  it('skips router when there is prior history and no mode', async () => {
    const consoleInfo = jest.spyOn(console, 'info').mockImplementation(() => undefined);
    helpers.getChatCompletion.mockResolvedValueOnce('ok-reply');

    const req: any = {
      json: async () => ({
        action: 'send_message_chat',
        stream: false,
        payload: {
          message: 'follow up',
          messages: [{ role: 'user', content: 'prev' }],
          language: 'en',
        },
      })
    };

    const res = await POST(req);
    expect(res).toBeInstanceOf(Response);

    const logs = consoleInfo.mock.calls.map((c) => String(c[0]));
    expect(logs.some((l) => l.includes('event=router_skip reason=has_history'))).toBe(true);
    const routerCalls = helpers.getChatCompletion.mock.calls.filter((c) => c[0]?.systemMessage === chatModeRouterPrompt);
    expect(routerCalls.length).toBe(0);

    consoleInfo.mockRestore();
  });

  it('streaming path emits stream_error payload on exception', async () => {
    helpers.reserveFreeChatTokens.mockResolvedValue(undefined);
    helpers.reserveFreeChatTokensForAnon.mockResolvedValue(undefined);
    helpers.streamChatCompletion.mockImplementation(async () => {
      throw new Error('boom');
    });

    const req: any = {
      json: async () => ({
        action: 'send_message_chat',
        stream: true,
        payload: {
          message: 'stream please',
          messages: [],
          language: 'en',
        },
      })
    };

    const res = (await POST(req)) as Response;
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');
    const reader = (res.body as ReadableStream<Uint8Array>).getReader();
    const chunks: string[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(new TextDecoder().decode(value));
    }
    const all = chunks.join('');
    expect(all).toContain('data: {"payload":{"error":"stream_error"}}');
  });

  it('streaming path emits free_limit_exceeded when token reservation fails', async () => {
    // Simulate rate limit by having reserveFreeChatTokensForAnon reject
    helpers.reserveFreeChatTokensForAnon.mockRejectedValueOnce(new Error('Rate limit exceeded'));

    const req: any = {
      json: async () => ({
        action: 'send_message_chat',
        stream: true,
        payload: {
          message: 'rate-limit-me',
          messages: [],
          language: 'en',
        },
      })
    };

    const res = (await POST(req)) as Response;
    expect(res.headers.get('Content-Type')).toContain('text/event-stream');
    const reader = (res.body as ReadableStream<Uint8Array>).getReader();
    const chunks: string[] = [];
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(new TextDecoder().decode(value));
    }
    const all = chunks.join('');
    expect(all).toContain('data: {"payload":{"error":"free_limit_exceeded"}}');
  });
});


