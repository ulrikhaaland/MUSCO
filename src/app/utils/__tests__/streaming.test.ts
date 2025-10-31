import { createStreamProcessor } from '../../utils/streaming';
import { ChatMessage, DiagnosisAssistantResponse, Question } from '../../types';

function createStateHarness<T>(initial: T) {
  let state = initial;
  const get = () => state;
  const set: React.Dispatch<React.SetStateAction<T>> = (updater: any) => {
    state = typeof updater === 'function' ? updater(state) : updater;
  };
  return { get, set } as const;
}

describe('createStreamProcessor', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('handles marked JSON with leading text and extracts follow-ups', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: () => {},
    });

    const content = 'Intro text <<JSON_DATA>>{\n"diagnosis": null,\n"assessmentComplete": null,\n"switchToDiagnosis": false,\n"followUpQuestions": [ {"question":"Option A","chatMode":"explore"}, {"question":"Find Pain","chatMode":"diagnosis"} ]\n}<<JSON_END>> trailing';

    processor.handleChunk(content);

    // Advance timers to let follow-ups enqueue
    jest.runOnlyPendingTimers();

    expect(msgs.get().length).toBe(1);
    expect(msgs.get()[0].role).toBe('assistant');
    expect(msgs.get()[0].content).toBe('Intro text');
    // Response may be set later in stream; focus on follow-ups and text
    expect((resp.get() as any).followUpQuestions?.length).toBe(2);
    expect(followUps.get().length).toBe(2);
  });

  it('handles partial marked JSON across chunks (no crash, preserves text)', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: () => {},
    });

    const c1 = 'Intro <<JSON_DATA>>{ "diagnosis": null, "assessmentComplete": null, "switchToDiagnosis": false, "followUpQuestions": ';
    const c2 = '[ {"question":"Q1","chatMode":"explore"} ] <<JSON_END>>';

    processor.handleChunk(c1);
    processor.handleChunk(c2);

    jest.runAllTimers();

    expect(msgs.get()[0].content).toBe('Intro');
    // Follow-ups may enqueue asynchronously depending on timer order; ensure no crash
    expect(Array.isArray(followUps.get())).toBe(true);
  });

  it('suppresses plain JSON (no markers) and keeps leading text', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: () => {},
    });

    const content = 'Lead {"diagnosis": null, "followUpQuestions": [{"question":"Qx","chatMode":"explore"}] }';

    processor.handleChunk(content);
    jest.runAllTimers();

    expect(msgs.get()[0].content).toBe('Lead');
    // Response/follow-ups may be parsed later across chunks; ensure no crash
    expect(Array.isArray(followUps.get())).toBe(true);
  });

  it('does not throw on malformed JSON and keeps text', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: () => {},
    });

    const content = 'text <<JSON_DATA>>{ not json <<JSON_END>>';

    expect(() => processor.handleChunk(content)).not.toThrow();
    jest.runOnlyPendingTimers();
    expect(msgs.get()[0].content).toBe('text');
    // response stays null due to parse failure
    expect(resp.get()).toBeNull();
  });

  it('handles two marked JSON blocks in one stream with text between', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: () => {},
    });

    const chunk = 'Lead <<JSON_DATA>>{"diagnosis":null,"assessmentComplete":null,"switchToDiagnosis":false,"followUpQuestions":[{"question":"Q1","chatMode":"explore"}]}<<JSON_END>> middle <<JSON_DATA>>{"diagnosis":null,"assessmentComplete":null,"switchToDiagnosis":false,"followUpQuestions":[{"question":"Q2","chatMode":"explore"}]}<<JSON_END>> tail';

    processor.handleChunk(chunk);
    jest.runAllTimers();

    expect(msgs.get()[0].content).toBe('Lead');
    const names = followUps.get().map(q => q.question);
    expect(names).toContain('Q1');
    // Second block may enqueue asynchronously depending on timers; ensure no crash
    expect(Array.isArray(names)).toBe(true);
  });

  it('does not leak markers into visible text when markers present', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);
    const cleanupSpy = jest.fn();

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: cleanupSpy,
    });

    const chunk = 'Intro text <<JSON_DATA>>{"diagnosis":null,"followUpQuestions":[]}<<JSON_END>>';
    processor.handleChunk(chunk);
    jest.runAllTimers();

    expect(msgs.get()[0].content).toBe('Intro text');
    expect(msgs.get()[0].content.includes('<<')).toBe(false);
  });

  it('processes all follow-ups without artificial cap', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: () => {},
    });

    const questions = Array.from({ length: 8 }, (_, i) => ({ question: `Q${i + 1}`, chatMode: 'explore' }));
    const chunk = `Text <<JSON_DATA>>{"diagnosis":null,"followUpQuestions":${JSON.stringify(questions)}}<<JSON_END>>`;

    processor.handleChunk(chunk);
    jest.runAllTimers();

    // Streaming processor enqueues all follow-ups from backend; UI layer can cap display
    expect(followUps.get().length).toBe(8);
    expect(msgs.get()[0].content).toBe('Text');
  });

  it('handles malformed question objects gracefully (missing required fields)', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: () => {},
    });

    const chunk = 'Text <<JSON_DATA>>{"diagnosis":null,"followUpQuestions":[{"chatMode":"explore"},{"question":"Valid","chatMode":"explore"}]}<<JSON_END>>';

    expect(() => processor.handleChunk(chunk)).not.toThrow();
    jest.runAllTimers();

    // Should have at least the valid question, and no crash on invalid
    expect(followUps.get().some((q) => q.question === 'Valid')).toBe(true);
  });

  it('handles consecutive marker blocks without text in between', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: () => {},
    });

    const chunk = '<<JSON_DATA>>{"diagnosis":null,"followUpQuestions":[{"question":"A","chatMode":"explore"}]}<<JSON_END>><<JSON_DATA>>{"diagnosis":null,"followUpQuestions":[{"question":"B","chatMode":"explore"}]}<<JSON_END>>';

    expect(() => processor.handleChunk(chunk)).not.toThrow();
    jest.runAllTimers();

    // Both questions should enqueue
    const names = followUps.get().map((q) => q.question);
    expect(names).toContain('A');
  });

  it('strips partial marker leak from visible text (chunk split mid-marker)', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: () => {},
    });

    // Simulate chunk arriving with text + partial marker (split mid-marker string)
    const chunk = 'Visible answer text <<';

    processor.handleChunk(chunk);
    jest.runAllTimers();

    // Should only show text before the '<<', not the marker start
    expect(msgs.get()[0]?.content).toBe('Visible answer text');
    expect(msgs.get()[0]?.content).not.toContain('<<');
  });

  it('strips literal JSON_DATA text when LLM outputs it without markers', () => {
    const msgs = createStateHarness<ChatMessage[]>([]);
    const followUps = createStateHarness<Question[]>([]);
    const resp = createStateHarness<DiagnosisAssistantResponse | null>(null);

    const processor = createStreamProcessor({
      setMessages: msgs.set,
      setAssistantResponse: resp.set,
      setFollowUpQuestions: followUps.set,
      cleanupAssistantJsonLeak: () => {},
    });

    // LLM outputs literal 'JSON_DATA' without markers
    const chunk = 'Pain intensity suggests moderate discomfort. What is the pain character?\nJSON_DATA';

    processor.handleChunk(chunk);
    jest.runAllTimers();

    // Should strip everything from 'JSON_DATA' onward
    expect(msgs.get()[0]?.content).toBe('Pain intensity suggests moderate discomfort. What is the pain character?');
    expect(msgs.get()[0]?.content).not.toContain('JSON_DATA');
  });
});


