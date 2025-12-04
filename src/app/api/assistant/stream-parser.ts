/**
 * Backend stream parser - extracts structured data from LLM responses
 * Handles <<JSON_DATA>> markers and emits clean SSE events to frontend
 */

import { DiagnosisAssistantResponse, Question } from '@/app/types';
import { Exercise } from '@/app/types/program';
import { augmentQuestion, detectProgramType } from '@/app/utils/questionAugmentation';

export interface StreamParserCallbacks {
  onText: (text: string) => void;
  onFollowUp: (question: Question) => void;
  onAssistantResponse: (response: DiagnosisAssistantResponse) => void;
  onExercises: (exercises: Exercise[], query?: string) => void;
  onComplete: () => void;
}

export class StreamParser {
  private accumulatedBuffer = '';
  private emittedTextLength = 0;
  private jsonDetected = false;
  private emittedFollowUps = new Set<string>();
  private lastAssistantResponse: DiagnosisAssistantResponse | null = null;
  private locale: string = 'en';

  constructor(
    private callbacks: StreamParserCallbacks,
    options?: { locale?: string }
  ) {
    this.locale = options?.locale || 'en';
  }

  processChunk(chunk: string): void {
    if (!chunk) return;

    this.accumulatedBuffer += chunk;

    // Check for complete JSON block with markers
    const markerStartIndex = this.accumulatedBuffer.indexOf('<<JSON_DATA>>');
    const markerEndIndex = this.accumulatedBuffer.indexOf('<<JSON_END>>');

    if (markerStartIndex !== -1 && markerEndIndex !== -1 && markerEndIndex > markerStartIndex) {
      // Extract text before markers (preserve whitespace, don't trim)
      const textBefore = this.accumulatedBuffer.substring(0, markerStartIndex);
      
      // Strip any literal 'JSON_DATA' or '<<' from text
      const cleanText = this.stripMarkers(textBefore);
      
      // Emit any new text we haven't sent yet
      if (cleanText.length > this.emittedTextLength) {
        const newText = cleanText.substring(this.emittedTextLength);
        this.emittedTextLength = cleanText.length;
        this.callbacks.onText(newText);
      }

      // Extract and parse JSON
      const jsonContent = this.accumulatedBuffer
        .substring(markerStartIndex + '<<JSON_DATA>>'.length, markerEndIndex)
        .trim();

      try {
        const response = JSON.parse(jsonContent) as DiagnosisAssistantResponse;
        
      // Auto-generate follow-ups if LLM failed to provide them
      if (!response.followUpQuestions || response.followUpQuestions.length === 0) {
        const generated = this.generateDefaultFollowUps();
        if (generated.length > 0) {
          response.followUpQuestions = generated;
        }
      }
        
        this.lastAssistantResponse = response;
        this.callbacks.onAssistantResponse(response);

        // Process follow-ups: separate program generation from regular questions
        if (response.followUpQuestions && Array.isArray(response.followUpQuestions)) {
          response.followUpQuestions.forEach((question) => {
            const key = question.question;
            if (!this.emittedFollowUps.has(key)) {
              this.emittedFollowUps.add(key);
              
              // Augment question with program detection
              const augmentedQuestion = augmentQuestion(question);
              const detection = detectProgramType(question.question);
              
              // Always emit as regular follow-up (with augmented fields if program gen)
              this.callbacks.onFollowUp(augmentedQuestion);
              
              // If this is a program button, also ensure "Answer in chat" is available
              if (detection.isProgram && !this.emittedFollowUps.has('Answer in chat')) {
                this.emittedFollowUps.add('Answer in chat');
                this.callbacks.onFollowUp({
                  question: 'Answer in chat',
                  chatMode: 'diagnosis',
                  title: 'Type your answer'
                } as any);
              }
            }
          });
        }

        this.jsonDetected = true;
      } catch (error) {
        console.warn('[StreamParser] Failed to parse JSON:', error);
      }

      // Keep content after end marker for next iteration (preserve whitespace)
      this.accumulatedBuffer = this.accumulatedBuffer
        .substring(markerEndIndex + '<<JSON_END>>'.length);

      return;
    }

    // If we have a start marker but no end yet, emit any text before it
    if (markerStartIndex !== -1 && markerEndIndex === -1) {
      const textBefore = this.accumulatedBuffer.substring(0, markerStartIndex);
      const cleanText = this.stripMarkers(textBefore);
      
      // Emit any new text progressively
      if (cleanText.length > this.emittedTextLength) {
        const newText = cleanText.substring(this.emittedTextLength);
        this.emittedTextLength = cleanText.length;
        this.callbacks.onText(newText);
      }

      // Parse partial JSON to extract follow-ups early (incremental parsing)
      const partialJson = this.accumulatedBuffer.substring(markerStartIndex + '<<JSON_DATA>>'.length);
      this.tryExtractFollowUps(partialJson);
      
      // Wait for more chunks
      return;
    }

    // No markers detected - emit text progressively
    if (!this.jsonDetected && !this.accumulatedBuffer.includes('<<JSON_DATA')) {
      // Check for plain JSON object
      const jsonMatch = this.accumulatedBuffer.match(/\{[\s\S]*?"diagnosis"[\s\S]*?\}/);
      if (jsonMatch) {
        const textBefore = this.accumulatedBuffer.substring(0, jsonMatch.index);
        const cleanText = this.stripMarkers(textBefore);
        
        // Emit any new text before JSON
        if (cleanText.length > this.emittedTextLength) {
          const newText = cleanText.substring(this.emittedTextLength);
          this.emittedTextLength = cleanText.length;
          this.callbacks.onText(newText);
        }

        try {
          const response = JSON.parse(jsonMatch[0]) as DiagnosisAssistantResponse;
          
        // Auto-generate follow-ups if LLM failed to provide them
        if (!response.followUpQuestions || !Array.isArray(response.followUpQuestions) || response.followUpQuestions.length === 0) {
          const generated = this.generateDefaultFollowUps();
          if (generated.length > 0) {
            response.followUpQuestions = generated;
          }
        }
        
        this.lastAssistantResponse = response;
        this.callbacks.onAssistantResponse(response);

          if (response.followUpQuestions && Array.isArray(response.followUpQuestions)) {
            response.followUpQuestions.forEach((question) => {
              const key = question.question;
              if (!this.emittedFollowUps.has(key)) {
                this.emittedFollowUps.add(key);
                
                // Augment question with program detection
                const augmentedQuestion = augmentQuestion(question);
                const detection = detectProgramType(question.question);
                
                // Always emit as regular follow-up (with augmented fields if program gen)
                this.callbacks.onFollowUp(augmentedQuestion);
                
                // If this is a program button, also ensure "Answer in chat" is available
                if (detection.isProgram && !this.emittedFollowUps.has('Answer in chat')) {
                  this.emittedFollowUps.add('Answer in chat');
                  this.callbacks.onFollowUp({
                    question: 'Answer in chat',
                    chatMode: 'diagnosis',
                    title: 'Type your answer'
                  } as any);
                }
              }
            });
          }

          this.jsonDetected = true;
        } catch {}
        
        this.accumulatedBuffer = this.accumulatedBuffer.substring((jsonMatch.index || 0) + jsonMatch[0].length);
        return;
      }

      // Plain text, no JSON - emit progressively
      const cleanText = this.stripMarkers(this.accumulatedBuffer);
      if (cleanText.length > this.emittedTextLength) {
        const newText = cleanText.substring(this.emittedTextLength);
        this.emittedTextLength = cleanText.length;
        this.callbacks.onText(newText);
      }
    }
  }

  async complete(): Promise<void> {
    // Emit any remaining text
    const cleanText = this.stripMarkers(this.accumulatedBuffer);
    if (cleanText.length > this.emittedTextLength) {
      const newText = cleanText.substring(this.emittedTextLength);
      this.callbacks.onText(newText);
    }
    
    // Check for exercise query markers in the accumulated buffer
    await this.detectAndFetchExercises();
    
    // If no follow-ups were emitted, always generate "Answer in chat" fallback
    if (this.emittedFollowUps.size === 0) {
      const generated = this.generateDefaultFollowUps();
      if (generated.length > 0) {
        // Update assistant response if we have one
        if (this.lastAssistantResponse) {
          this.lastAssistantResponse.followUpQuestions = generated;
          this.callbacks.onAssistantResponse(this.lastAssistantResponse);
        }
        // Always emit follow-up buttons
        generated.forEach((question) => {
          const key = question.question;
          if (!this.emittedFollowUps.has(key)) {
            this.emittedFollowUps.add(key);
            this.callbacks.onFollowUp(question);
          }
        });
      }
    }
    
    this.callbacks.onComplete();
  }

  private tryExtractFollowUps(partialJson: string): void {
    // Try to extract complete question objects from partial JSON as they stream in
    // More flexible regex that handles various field orders and whitespace
    const questionPattern = /\{\s*"question"\s*:\s*"([^"]+)"[^\}]*?\}/g;
    let match;
    
    while ((match = questionPattern.exec(partialJson)) !== null) {
      const fullMatch = match[0];
      const questionText = match[1];
      
      // Extract chatMode from the matched object (may come after question field)
      const chatModeMatch = fullMatch.match(/"chatMode"\s*:\s*"(diagnosis|explore|assessment)"/);
      const chatMode = (chatModeMatch ? chatModeMatch[1] : 'diagnosis') as 'diagnosis' | 'explore';
      
      if (!this.emittedFollowUps.has(questionText)) {
        this.emittedFollowUps.add(questionText);
        this.callbacks.onFollowUp({
          question: questionText,
          chatMode,
        } as any);
      }
    }
  }

  private generateDefaultFollowUps(): any[] {
    // Simple fallback: provide "Answer in chat" button that focuses input
    return [
      { question: 'Answer in chat', chatMode: 'diagnosis', title: 'Type your answer' },
    ];
  }

  private stripMarkers(text: string): string {
    if (!text) return text;
    
    // Strip any occurrence of '<<', 'JSON_DATA', '<<JSON_DATA', etc.
    let cleaned = text;
    
    // Remove literal 'JSON_DATA' text (don't trim to preserve whitespace)
    const jsonDataIdx = cleaned.indexOf('JSON_DATA');
    if (jsonDataIdx !== -1) {
      cleaned = cleaned.substring(0, jsonDataIdx);
    }
    
    // Remove any '<<' markers (don't trim to preserve whitespace)
    const markerIdx = cleaned.indexOf('<<');
    if (markerIdx !== -1) {
      cleaned = cleaned.substring(0, markerIdx);
    }
    
    return cleaned;
  }

  private async detectAndFetchExercises(): Promise<void> {
    // Look for exercise query markers: <<EXERCISE_QUERY:bodypart:query>>
    const exercisePattern = /<<EXERCISE_QUERY:([^:>]*):([^>]*)>>/g;
    let match;
    
    while ((match = exercisePattern.exec(this.accumulatedBuffer)) !== null) {
      const bodyPart = match[1]?.trim();
      const query = match[2]?.trim();
      
      try {
        // Call internal exercise search API
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
        const response = await fetch(`${baseUrl}/api/exercises/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bodyParts: bodyPart ? [bodyPart] : [],
            query: query || '',
            limit: 3, // Limit to 3 exercises per query in chat
            locale: this.locale,
          }),
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.exercises && data.exercises.length > 0) {
            this.callbacks.onExercises(data.exercises, query);
          }
        }
      } catch {
        // Silently fail - don't break the stream
      }
    }
  }

  reset(): void {
    this.accumulatedBuffer = '';
    this.emittedTextLength = 0;
    this.jsonDetected = false;
    this.emittedFollowUps.clear();
  }
}

