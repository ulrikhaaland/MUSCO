import OpenAI from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true, // Note: In production, you should use server-side API calls
});

export interface ChatRequest {
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[];
  bodyPart: string;
}

export async function chat({ messages, bodyPart }: ChatRequest) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: 'system',
          content: `You are a knowledgeable assistant specializing in musculoskeletal health and anatomy. 
                   You are currently discussing the ${bodyPart}. Keep responses focused on this body part 
                   and provide accurate, helpful information about anatomy, common issues, exercises, and recovery.`
        },
        ...messages
      ],
    });

    return completion.choices[0].message;
  } catch (error) {
    console.error('Error in OpenAI chat:', error);
    throw new Error('Failed to get response from OpenAI');
  }
}

export async function generateExerciseProgram(bodyPart: string, userPreferences: {
  age: number;
  fitnessLevel: string;
  frequency: number;
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: 'system',
          content: `Create a detailed exercise program for the ${bodyPart}. 
                   Consider the user is ${userPreferences.age} years old, 
                   at a ${userPreferences.fitnessLevel} fitness level, 
                   and wants to exercise ${userPreferences.frequency} times per week.`
        }
      ],
    });

    return completion.choices[0].message;
  } catch (error) {
    console.error('Error generating exercise program:', error);
    throw new Error('Failed to generate exercise program');
  }
} 