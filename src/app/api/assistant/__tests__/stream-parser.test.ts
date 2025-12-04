import { StreamParser } from '../stream-parser';
import { Question } from '@/app/types';

describe('StreamParser', () => {
  describe('basic text streaming', () => {
    it('emits text chunks progressively', () => {
      const textChunks: string[] = [];
      const parser = new StreamParser({
        onText: (text) => textChunks.push(text),
        onFollowUp: jest.fn(),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      parser.processChunk('Hello ');
      parser.processChunk('world!');

      expect(textChunks).toEqual(['Hello ', 'world!']);
    });

    it('preserves whitespace and newlines', () => {
      const textChunks: string[] = [];
      const parser = new StreamParser({
        onText: (text) => textChunks.push(text),
        onFollowUp: jest.fn(),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      parser.processChunk('Line 1\n\nLine 2  ');

      expect(textChunks[0]).toBe('Line 1\n\nLine 2  ');
    });
  });

  describe('JSON parsing with markers', () => {
    it('strips <<JSON_DATA>> markers from visible text', () => {
      const textChunks: string[] = [];
      const onAssistantResponse = jest.fn();
      const parser = new StreamParser({
        onText: (text) => textChunks.push(text),
        onFollowUp: jest.fn(),
        onAssistantResponse,
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = 'Visible text <<JSON_DATA>>{"diagnosis":null}<<JSON_END>>';
      parser.processChunk(chunk);

      expect(textChunks.join('')).toBe('Visible text ');
      expect(textChunks.join('')).not.toContain('<<JSON_DATA>>');
      expect(textChunks.join('')).not.toContain('<<JSON_END>>');
    });

    it('parses valid JSON and emits assistant response', () => {
      const onAssistantResponse = jest.fn();
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: jest.fn(),
        onAssistantResponse,
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = '<<JSON_DATA>>{"diagnosis":"test","assessmentComplete":false,"followUpQuestions":[]}<<JSON_END>>';
      parser.processChunk(chunk);

      expect(onAssistantResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          diagnosis: 'test',
          assessmentComplete: false,
        })
      );
    });

    it('handles malformed JSON gracefully', () => {
      const warnSpy = jest.spyOn(console, 'warn').mockImplementation();
      const onAssistantResponse = jest.fn();
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: jest.fn(),
        onAssistantResponse,
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = '<<JSON_DATA>>{invalid json}<<JSON_END>>';
      parser.processChunk(chunk);

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('[StreamParser] Failed to parse JSON'),
        expect.any(Error)
      );
      expect(onAssistantResponse).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  describe('follow-up question extraction', () => {
    it('extracts and emits follow-up questions incrementally', () => {
      const followUps: Question[] = [];
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: (q) => followUps.push(q),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = `<<JSON_DATA>>{
  "diagnosis": null,
  "followUpQuestions": [
    {"question": "Option 1", "chatMode": "diagnosis"},
    {"question": "Option 2", "chatMode": "diagnosis"}
  ]
}<<JSON_END>>`;
      parser.processChunk(chunk);

      expect(followUps).toHaveLength(2);
      expect(followUps[0].question).toBe('Option 1');
      expect(followUps[1].question).toBe('Option 2');
    });

    it('deduplicates follow-up questions by text', () => {
      const followUps: Question[] = [];
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: (q) => followUps.push(q),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk1 = `<<JSON_DATA>>{"followUpQuestions":[{"question":"Same","chatMode":"explore"}]}<<JSON_END>>`;
      const chunk2 = `<<JSON_DATA>>{"followUpQuestions":[{"question":"Same","chatMode":"explore"}]}<<JSON_END>>`;

      parser.processChunk(chunk1);
      parser.processChunk(chunk2);

      expect(followUps).toHaveLength(1); // Should only emit once
    });

    it('auto-generates "Answer in chat" fallback when no follow-ups provided', () => {
      const followUps: Question[] = [];
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: (q) => followUps.push(q),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = `<<JSON_DATA>>{"diagnosis":null,"followUpQuestions":[]}<<JSON_END>>`;
      parser.processChunk(chunk);

      expect(followUps).toHaveLength(1);
      expect(followUps[0].question).toBe('Answer in chat');
    });
  });

  describe('program generation detection', () => {
    it('detects "Recovery only" and augments with generate:true and programType', () => {
      const followUps: Question[] = [];
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: (q) => followUps.push(q),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = `<<JSON_DATA>>{"followUpQuestions":[{"question":"Recovery only","chatMode":"explore"}]}<<JSON_END>>`;
      parser.processChunk(chunk);

      expect(followUps[0].question).toBe('Recovery only');
      expect((followUps[0] as any).generate).toBe(true);
      expect((followUps[0] as any).programType).toBe('recovery');
    });

    it('detects "Exercise + recovery" and augments correctly', () => {
      const followUps: Question[] = [];
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: (q) => followUps.push(q),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = `<<JSON_DATA>>{"followUpQuestions":[{"question":"I want exercise and recovery","chatMode":"explore"}]}<<JSON_END>>`;
      parser.processChunk(chunk);

      expect((followUps[0] as any).generate).toBe(true);
      expect((followUps[0] as any).programType).toBe('exercise_and_recovery');
    });

    it('detects Norwegian "kun rehabilitering"', () => {
      const followUps: Question[] = [];
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: (q) => followUps.push(q),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = `<<JSON_DATA>>{"followUpQuestions":[{"question":"Kun rehabilitering","chatMode":"explore"}]}<<JSON_END>>`;
      parser.processChunk(chunk);

      expect((followUps[0] as any).generate).toBe(true);
      expect((followUps[0] as any).programType).toBe('recovery');
    });

    it('adds "Answer in chat" when program generation button detected', () => {
      const followUps: Question[] = [];
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: (q) => followUps.push(q),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = `<<JSON_DATA>>{"followUpQuestions":[{"question":"Recovery only","chatMode":"explore"}]}<<JSON_END>>`;
      parser.processChunk(chunk);

      expect(followUps).toHaveLength(2); // Recovery only + Answer in chat
      expect(followUps[1].question).toBe('Answer in chat');
    });
  });

  describe('marker hygiene', () => {
    it('strips literal JSON_DATA text when LLM outputs it without markers', () => {
      const textChunks: string[] = [];
      const parser = new StreamParser({
        onText: (text) => textChunks.push(text),
        onFollowUp: jest.fn(),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = 'Pain intensity suggests moderate discomfort.\nJSON_DATA';
      parser.processChunk(chunk);

      // Should strip from JSON_DATA onward (including the newline before it)
      expect(textChunks.join('')).toBe('Pain intensity suggests moderate discomfort.\n');
      expect(textChunks.join('')).not.toContain('JSON_DATA');
    });

    it('strips partial marker leaks (e.g., "<<")', () => {
      const textChunks: string[] = [];
      const parser = new StreamParser({
        onText: (text) => textChunks.push(text),
        onFollowUp: jest.fn(),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = 'Visible text <<';
      parser.processChunk(chunk);

      // Should preserve text before marker (with trailing space)
      expect(textChunks.join('')).toBe('Visible text ');
      expect(textChunks.join('')).not.toContain('<<');
    });
  });

  describe('complete() method', () => {
    it('emits "Answer in chat" if no follow-ups were emitted during stream', async () => {
      const followUps: Question[] = [];
      const onComplete = jest.fn();
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: (q) => followUps.push(q),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete,
      });

      // Stream with no JSON or follow-ups
      parser.processChunk('Just plain text');
      await parser.complete();

      expect(followUps).toHaveLength(1);
      expect(followUps[0].question).toBe('Answer in chat');
      expect(onComplete).toHaveBeenCalled();
    });

    it('does not emit duplicate "Answer in chat" if already emitted', async () => {
      const followUps: Question[] = [];
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: (q) => followUps.push(q),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = `<<JSON_DATA>>{"followUpQuestions":[]}<<JSON_END>>`;
      parser.processChunk(chunk); // Triggers auto-generation
      await parser.complete();

      expect(followUps).toHaveLength(1); // Only one "Answer in chat"
    });
  });

  describe('multi-chunk streaming', () => {
    it('handles JSON split across multiple chunks', () => {
      const onAssistantResponse = jest.fn();
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: jest.fn(),
        onAssistantResponse,
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      parser.processChunk('Text before <<JSON_DATA>>{"diagn');
      parser.processChunk('osis":"test","assessmentComplete":fa');
      parser.processChunk('lse,"followUpQuestions":[]}<<JSON_END>>');

      expect(onAssistantResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          diagnosis: 'test',
          assessmentComplete: false,
        })
      );
    });

    it('emits text progressively without waiting for JSON', () => {
      const textChunks: string[] = [];
      const parser = new StreamParser({
        onText: (text) => textChunks.push(text),
        onFollowUp: jest.fn(),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      parser.processChunk('First ');
      parser.processChunk('second ');
      parser.processChunk('third');

      expect(textChunks).toEqual(['First ', 'second ', 'third']);
    });
  });

  describe('edge cases', () => {
    it('handles empty chunks gracefully', () => {
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: jest.fn(),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      expect(() => parser.processChunk('')).not.toThrow();
      expect(() => parser.processChunk(null as any)).not.toThrow();
    });

    it('handles chunks with only whitespace', () => {
      const textChunks: string[] = [];
      const parser = new StreamParser({
        onText: (text) => textChunks.push(text),
        onFollowUp: jest.fn(),
        onAssistantResponse: jest.fn(),
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      parser.processChunk('   \n\n  ');

      // Should preserve whitespace
      expect(textChunks[0]).toBe('   \n\n  ');
    });

    it('handles multiple JSON blocks in single stream', () => {
      const onAssistantResponse = jest.fn();
      const parser = new StreamParser({
        onText: jest.fn(),
        onFollowUp: jest.fn(),
        onAssistantResponse,
        onExercises: jest.fn(),
        onComplete: jest.fn(),
      });

      const chunk = `<<JSON_DATA>>{"diagnosis":"first","followUpQuestions":[]}<<JSON_END>> text <<JSON_DATA>>{"diagnosis":"second","followUpQuestions":[]}<<JSON_END>>`;
      parser.processChunk(chunk);

      // StreamParser processes only the first JSON block found
      expect(onAssistantResponse).toHaveBeenCalledTimes(1);
      expect(onAssistantResponse).toHaveBeenCalledWith(
        expect.objectContaining({
          diagnosis: 'first',
        })
      );
    });
  });
});

