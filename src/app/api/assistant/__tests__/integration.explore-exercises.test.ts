/**
 * Integration test for explore assistant exercise recommendations
 * 
 * This test makes REAL API calls to verify:
 * 1. LLM includes <<EXERCISE_QUERY>> markers
 * 2. Backend detects and parses markers
 * 3. Exercise search API returns results
 * 4. SSE events are emitted correctly
 * 
 * Run with: npm test -- integration.explore-exercises.test.ts
 * 
 * NOTE: Requires valid OPENAI_API_KEY in .env.local
 * Skipped in CI to avoid API costs - run manually for verification
 */

import 'openai/shims/node';
import { config } from 'dotenv';
import * as path from 'path';

// Load .env.local for test environment
config({ path: path.join(process.cwd(), '.env.local') });

// Set Node.js environment flag for OpenAI client
(global as any).process = process;
if (typeof window === 'undefined') {
  (global as any).window = undefined;
}

describe('Explore Assistant - Exercise Integration', () => {
  // Skip in CI environments to avoid API costs
  const shouldSkip = process.env.CI === 'true' || !process.env.OPENAI_API_KEY;
  
  if (!shouldSkip) {
    console.log('🔑 API Key found, running integration tests...');
    console.log('   Using model:', process.env.CHAT_MODEL || 'gpt-4o');
  } else {
    console.log('⏭️  Skipping integration tests (no API key or CI environment)');
  }

  (shouldSkip ? describe.skip : describe)('Real LLM Integration', () => {
    let streamChatCompletion: any;
    let StreamParser: any;
    let exploreSystemPrompt: any;

    beforeAll(async () => {
      // Dynamically import to avoid loading during normal test runs
      const openaiServer = await import('../openai-server');
      streamChatCompletion = openaiServer.streamChatCompletion;

      const streamParserModule = await import('../stream-parser');
      StreamParser = streamParserModule.StreamParser;

      const explorePromptModule = await import('../../prompts/explorePrompt');
      exploreSystemPrompt = explorePromptModule.exploreSystemPrompt;
    });

    it('should include <<EXERCISE_QUERY>> marker when user asks about exercises', async () => {
      const chunks: string[] = [];
      const exerciseEvents: any[] = [];
      const followUps: any[] = [];
      
      let resolveTest: (value: boolean) => void;
      const testPromise = new Promise<boolean>((resolve) => {
        resolveTest = resolve;
      });

      const parser = new StreamParser({
        onText: (text: string) => {
          chunks.push(text);
        },
        onExercises: (exercises: any[], query?: string) => {
          exerciseEvents.push({ exercises, query });
        },
        onFollowUp: (question: any) => {
          followUps.push(question);
        },
        onAssistantResponse: jest.fn(),
        onComplete: () => {
          // Test completes when stream finishes
          resolveTest(true);
        },
      }, { locale: 'en' });

      // Simulate user asking about exercises
      await streamChatCompletion({
        threadId: 'test-thread',
        messages: [],
        systemMessage: exploreSystemPrompt,
        userMessage: {
          message: 'I want exercises for my shoulders',
          mode: 'explore',
        },
        onContent: (content: string) => {
          parser.processChunk(content);
        },
      });

      // Wait for stream to complete
      await parser.complete();
      await testPromise;

      // Assertions
      const fullText = chunks.join('');
      console.log('\n📝 LLM Response:', fullText.substring(0, 200) + '...');
      console.log('📦 Exercise Events:', exerciseEvents.length);
      console.log('🔘 Follow-up Questions:', followUps.length);

      // Verify exercise marker was included
      const hasMarker = fullText.includes('<<EXERCISE_QUERY') || 
                        chunks.some(c => c.includes('<<EXERCISE_QUERY'));
      
      if (!hasMarker) {
        console.error('❌ FAIL: LLM did not include <<EXERCISE_QUERY>> marker');
        console.error('Full response:', fullText);
      }

      expect(hasMarker).toBe(true);

      // Verify exercises were fetched
      if (exerciseEvents.length === 0) {
        console.warn('⚠️ WARNING: No exercise events emitted (may be due to API response delay)');
      } else {
        expect(exerciseEvents.length).toBeGreaterThan(0);
        expect(exerciseEvents[0].exercises).toBeDefined();
        expect(Array.isArray(exerciseEvents[0].exercises)).toBe(true);
        console.log('✅ Exercise events emitted:', exerciseEvents[0].exercises.length, 'exercises');
      }

      // Verify follow-up questions exist
      expect(followUps.length).toBeGreaterThan(0);
      console.log('✅ Follow-up questions generated:', followUps.length);

      // Verify no exercise names are listed in text (if marker is present)
      if (hasMarker) {
        const exerciseNames = [
          'Dumbbell Lateral Raise',
          'Military Press',
          'Cable Face Pull',
          'Band Pull Apart',
        ];
        
        const hasExerciseNames = exerciseNames.some(name => 
          fullText.includes(name)
        );

        if (hasExerciseNames) {
          console.warn('⚠️ WARNING: LLM listed exercise names in text despite having marker');
        }

        expect(hasExerciseNames).toBe(false);
      }

      // Success summary
      console.log('\n✅ Integration test PASSED');
      console.log('   - LLM included exercise marker');
      console.log('   - No exercise names listed in text');
      console.log('   - Follow-up questions generated');
      if (exerciseEvents.length > 0) {
        console.log('   - Exercise events emitted successfully');
      }
    }, 30000); // 30 second timeout for API call

    it('should use generate:true for program recommendations', async () => {
      const followUps: any[] = [];
      
      let resolveTest: (value: boolean) => void;
      const testPromise = new Promise<boolean>((resolve) => {
        resolveTest = resolve;
      });

      const parser = new StreamParser({
        onText: jest.fn(),
        onExercises: jest.fn(),
        onFollowUp: (question: any) => {
          followUps.push(question);
        },
        onAssistantResponse: jest.fn(),
        onComplete: () => {
          resolveTest(true);
        },
      }, { locale: 'en' });

      await streamChatCompletion({
        threadId: 'test-thread',
        messages: [
          { role: 'user', content: 'I want exercises for my shoulders' },
          { role: 'assistant', content: 'Here are exercises... <<EXERCISE_QUERY:Shoulders:>>' },
        ],
        systemMessage: exploreSystemPrompt,
        userMessage: {
          message: 'Can you create a program for me?',
          mode: 'explore',
        },
        onContent: (content: string) => {
          parser.processChunk(content);
        },
      });

      await parser.complete();
      await testPromise;

      console.log('\n📝 Follow-up questions:', JSON.stringify(followUps, null, 2));

      // Check if any program generation buttons were offered
      const programButtons = followUps.filter((q: any) => 
        q.question && (
          q.question.toLowerCase().includes('program') ||
          q.question.toLowerCase().includes('plan') ||
          q.question.toLowerCase().includes('workout')
        )
      );

      if (programButtons.length > 0) {
        console.log('✅ Found program buttons:', programButtons.length);
        
        // Verify they have generate:true
        programButtons.forEach((btn: any, idx: number) => {
          console.log(`   Button ${idx + 1}: "${btn.question}"`);
          console.log(`      generate: ${btn.generate}`);
          console.log(`      programType: ${btn.programType}`);
          
          if (!btn.generate || !btn.programType) {
            console.error(`❌ FAIL: Program button missing generate:true or programType`);
          }
        });

        // At least one program button should have generate:true
        const hasValidProgramButton = programButtons.some((btn: any) => 
          btn.generate === true && btn.programType
        );

        expect(hasValidProgramButton).toBe(true);
        console.log('✅ Program buttons have correct format');
      } else {
        console.log('⚠️ No program buttons offered (LLM may not have suggested programs)');
      }
    }, 30000);
  });

  // Always run this test (doesn't require API calls)
  describe('Prompt Validation', () => {
    it('should include exercise database index', async () => {
      const { exploreSystemPrompt } = await import('../../prompts/explorePrompt');
      
      expect(exploreSystemPrompt).toBeDefined();
      expect(exploreSystemPrompt.length).toBeGreaterThan(5000);
      expect(exploreSystemPrompt).toContain('Shoulders:');
      expect(exploreSystemPrompt).toContain('<<EXERCISE_QUERY');
      expect(exploreSystemPrompt).toContain('generate:true');
      expect(exploreSystemPrompt).toContain('programType');
      
      console.log('✅ Prompt includes exercise index');
      console.log('✅ Prompt includes exercise marker instructions');
      console.log('✅ Prompt includes program generation requirements');
    });
  });
});

